import { Injectable, inject, resource } from '@angular/core';
import type {
  PartData,
  WorkEntry,
  WorkEntryStatus,
} from '../models/database.types';
import { SupabaseService } from './supabase.service';
import { VentPart, Company } from '../models';

/**
 * Service to manage work entries
 * Handles hybrid mode: DB for authenticated users, localStorage for anonymous
 */
@Injectable({ providedIn: 'root' })
export class WorkEntryService {
  private supabaseService = inject(SupabaseService);
  private readonly STORAGE_KEY = 'vw_entries';

  /**
   * Helper to get local date string YYYY-MM-DD
   */
  private toLocalDateString(date: Date | number | string): string {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Helper to fetch companies for mapping
   */
  async fetchCompanies(): Promise<{ success: boolean; companies?: Company[] }> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase.from('companies').select('id, name');
    if (error) return { success: false };
    return { success: true, companies: data as Company[] };
  }

  // Resource for loading entries
  entriesResource = resource({
    loader: async () => {
      if (this.supabaseService.isAuthenticated()) {
        return this.fetchFromSupabase();
      }
      return this.fetchFromLocalStorage();
    },
  });

  /**
   * Get all entries (public wrapper for sync)
   */
  async getAllEntries(): Promise<WorkEntry[]> {
    if (this.supabaseService.isAuthenticated()) {
      return this.fetchFromSupabase();
    }
    return this.fetchFromLocalStorage();
  }

  /**
   * Fetch entries from Supabase for authenticated users
   */
  private async fetchFromSupabase(): Promise<WorkEntry[]> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('work_entries')
      .select('*')
      .order('entry_date', { ascending: false });

    if (error) {
      console.error('Failed to fetch entries:', error);
      return [];
    }

    return data as WorkEntry[];
  }

  /**
   * Fetch entries from localStorage for anonymous users
   */
  private fetchFromLocalStorage(): WorkEntry[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return [];

    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('Failed to parse localStorage entries:', error);
      return [];
    }
  }

  /**
   * Save work entry (to DB if logged in, localStorage otherwise)
   */
  async saveEntry(
    parts: PartData[],
    companyId?: string | null,
    date: string = this.toLocalDateString(new Date()),
  ): Promise<{ success: boolean; error?: string }> {
    if (this.supabaseService.isAuthenticated()) {
      return this.saveToSupabase(parts, companyId, date);
    }
    return this.saveToLocalStorage(parts, date);
  }

  /**
   * Save entry to Supabase (Upsert logic)
   */
  private async saveToSupabase(
    parts: PartData[],
    companyId: string | null | undefined,
    date: string,
  ): Promise<{ success: boolean; error?: string }> {
    const userId = this.supabaseService.user()?.id;
    if (!userId) {
      return { success: false, error: 'User not authenticated' };
    }

    const supabase = this.supabaseService.getClient();

    // Check if entry exists for this date (regardless of company)
    const query = supabase
      .from('work_entries')
      .select('id')
      .eq('user_id', userId)
      .eq('entry_date', date);

    const { data: existing, error: fetchError } = await query.limit(1).maybeSingle();

    if (fetchError) {
      console.error('Failed to check existing entry:', fetchError);
    }

    if (existing) {
      // Update existing entry, potentially changing the company_id
      const { error } = await supabase
        .from('work_entries')
        .update({
          parts_data: parts,
          company_id: companyId || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (error) {
        console.error('Failed to update entry:', error);
        return { success: false, error: 'Failed to update entry' };
      }
    } else {
      // Insert new entry
      const { error } = await supabase.from('work_entries').insert({
        user_id: userId,
        company_id: companyId || null,
        entry_date: date,
        parts_data: parts,
        status: 'draft',
      });

      if (error) {
        console.error('Failed to save entry:', error);
        return { success: false, error: 'Failed to save entry' };
      }
    }

    return { success: true };
  }

  /**
   * Save entry to localStorage
   */
  private saveToLocalStorage(
    parts: PartData[],
    date: string,
  ): { success: boolean } {
    try {
      const entries = this.fetchFromLocalStorage();
      const newEntry: Partial<WorkEntry> = {
        id: crypto.randomUUID(),
        entry_date: date,
        parts_data: parts,
        status: 'draft' as WorkEntryStatus,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      entries.push(newEntry as WorkEntry);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(entries));

      return { success: true };
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      return { success: false };
    }
  }

  /**
   * Sync local VentParts (from WorkLogService) to Supabase
   * Groups parts by date and uploads them.
   */
  async syncLocalParts(
    localParts: VentPart[],
  ): Promise<{ success: boolean; syncedCount: number; error?: string }> {
    if (!this.supabaseService.isAuthenticated()) {
      return { success: false, syncedCount: 0, error: 'Not authenticated' };
    }

    try {
      // Group parts by date
      const grouped = new Map<string, PartData[]>();

      for (const part of localParts) {
        const date = this.toLocalDateString(part.date);
        
        const partData: PartData = {
          ...part, // Include original fields (id, person, unit, etc.)
          partType: part.type,
          size: part.sizeDisplay ? parseInt(part.sizeDisplay) : 0,
          amount: part.amount,
          conditions: [],
        };

        const existing = grouped.get(date) || [];
        existing.push(partData);
        grouped.set(date, existing);
      }

      let syncedCount = 0;

      // Upload each group
      for (const [date, parts] of grouped.entries()) {
        // Use the company context from the first part in the group
        const representativePart = localParts.find(p => this.toLocalDateString(p.date) === date);
        const companyId = representativePart?.companyId ?? null;

        const result = await this.saveEntry(parts, companyId, date);
        if (result.success) {
          syncedCount += parts.length;
        }
      }

      return { success: true, syncedCount };
    } catch (error) {
      console.error('Sync error:', error);
      return { success: false, syncedCount: 0, error: 'Sync failed' };
    }
  }

  /**
   * Update entry status (submit for review, approve, etc.)
   */
  async updateEntryStatus(
    entryId: string,
    status: WorkEntryStatus,
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.supabaseService.isAuthenticated()) {
      return { success: false, error: 'Must be logged in to update status' };
    }

    const supabase = this.supabaseService.getClient();
    const { error } = await supabase
      .from('work_entries')
      .update({ status })
      .eq('id', entryId);

    if (error) {
      console.error('Failed to update status:', error);
      return { success: false, error: 'Failed to update status' };
    }

    return { success: true };
  }

  /**
   * Get all work entries for a specific company (Manager only)
   */
  async getCompanyWorkEntries(
    companyId: string,
    status?: WorkEntryStatus,
  ): Promise<{
    success: boolean;
    entries?: Array<WorkEntry & { profile: { full_name: string } }>;
    error?: string;
  }> {
    const userId = this.supabaseService.user()?.id;
    if (!userId || !this.supabaseService.isManager()) {
      return { success: false, error: 'Not authorized' };
    }

    try {
      const supabase = this.supabaseService.getClient();

      let query = supabase
        .from('work_entries')
        .select(
          `
          *,
          profile:user_id (
            full_name
          )
        `,
        )
        .eq('company_id', companyId)
        .order('entry_date', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Failed to fetch company entries:', error);
        return { success: false, error: 'Failed to fetch entries' };
      }

      return { success: true, entries: data as any };
    } catch (error) {
      console.error('Fetch company entries error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  /**
   * Approve a work entry
   */
  async approveEntry(entryId: string): Promise<{ success: boolean; error?: string }> {
    return this.updateEntryStatus(entryId, 'approved');
  }

  /**
   * Dispute a work entry
   */
  async disputeEntry(
    entryId: string,
    reason: string,
  ): Promise<{ success: boolean; error?: string }> {
    const userId = this.supabaseService.user()?.id;
    if (!userId || !this.supabaseService.isManager()) {
      return { success: false, error: 'Not authorized' };
    }

    try {
      const supabase = this.supabaseService.getClient();

      // 1. Create a review record with the dispute reason
      const { error: reviewError } = await supabase.from('entry_reviews').insert({
        entry_id: entryId,
        reviewer_id: userId,
        review_note: reason,
        // We'll populate parts data if we implement detailed line-item reviews later
        original_parts_data: [],
        reviewed_parts_data: [],
      });

      if (reviewError) {
        console.error('Failed to create review record:', reviewError);
        return { success: false, error: 'Failed to record dispute reason' };
      }

      // 2. Update status to disputed
      return this.updateEntryStatus(entryId, 'disputed');
    } catch (error) {
      console.error('Dispute entry error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  /**
   * Check if localStorage has data (for migration prompt)
   */
  hasLocalStorageData(): boolean {
    const entries = this.fetchFromLocalStorage();
    return entries.length > 0;
  }

  /**
   * Migrate localStorage data to Supabase
   */
  async migrateLocalStorageToSupabase(
    companyId: string,
  ): Promise<{ success: boolean; migrated: number; error?: string }> {
    const userId = this.supabaseService.user()?.id;
    if (!userId) {
      return { success: false, migrated: 0, error: 'User not authenticated' };
    }

    const entries = this.fetchFromLocalStorage();
    if (entries.length === 0) {
      return { success: true, migrated: 0 };
    }

    try {
      const supabase = this.supabaseService.getClient();

      // Convert localStorage entries to Supabase format
      const entriesToInsert = entries.map((entry) => ({
        user_id: userId,
        company_id: companyId,
        entry_date: entry.entry_date,
        parts_data: entry.parts_data,
        status: 'draft' as WorkEntryStatus,
      }));

      const { error } = await supabase
        .from('work_entries')
        .insert(entriesToInsert);

      if (error) {
        console.error('Migration failed:', error);
        return { success: false, migrated: 0, error: 'Failed to migrate data' };
      }

      // Clear localStorage after successful migration
      localStorage.removeItem(this.STORAGE_KEY);

      return { success: true, migrated: entries.length };
    } catch (error) {
      console.error('Migration error:', error);
      return {
        success: false,
        migrated: 0,
        error: 'An unexpected error occurred',
      };
    }
  }
}
