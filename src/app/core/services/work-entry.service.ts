import { DestroyRef, Injectable, inject } from '@angular/core';
import { RealtimeChannel } from '@supabase/supabase-js';
import { Subject } from 'rxjs';
import { Company } from '../models';
import type {
  PartData,
  WorkEntry,
  WorkEntryStatus,
} from '../models/database.types';
import { SupabaseService } from './supabase.service';

/**
 * Service to manage work entries (Cloud Only).
 * LocalStorage fallback removed from here as it's now handled by WorkLogService exclusively.
 */
@Injectable({ providedIn: 'root' })
export class WorkEntryService {
  private supabaseService = inject(SupabaseService);
  private destroyRef = inject(DestroyRef);

  // Centralized Realtime Updates Subject
  // Emits payload when any relevant change occurs
  readonly entryUpdates$ = new Subject<{
    type: 'user' | 'company';
    id: string;
    event: any;
  }>();

  private userSubscription: RealtimeChannel | null = null;
  private companySubscriptions = new Map<string, RealtimeChannel>();

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.unsubscribeAll();
    });
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

  /**
   * Get specific entry by date (Cloud Only)
   */
  async getEntryByDate(date: string): Promise<WorkEntry | null> {
    if (!this.supabaseService.isAuthenticated()) return null;

    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('work_entries')
      .select('*')
      .eq('user_id', this.supabaseService.user()?.id)
      .eq('entry_date', date)
      .maybeSingle();

    if (error) {
      console.error('Failed to fetch entry:', error);
      return null;
    }

    return data as WorkEntry;
  }

  /**
   * Save work entry to Cloud (Upsert)
   * ALWAYS resets status to 'draft' on change.
   */
  async saveEntry(
    parts: PartData[],
    companyId?: string | null,
    date: string = new Date().toISOString().split('T')[0],
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.supabaseService.isAuthenticated()) {
      return { success: false, error: 'User not authenticated' };
    }

    const userId = this.supabaseService.user()?.id;
    if (!userId) return { success: false, error: 'User ID missing' };

    const supabase = this.supabaseService.getClient();

    // Check existing
    const query = supabase
      .from('work_entries')
      .select('id')
      .eq('user_id', userId)
      .eq('entry_date', date);

    const { data: existing, error: fetchError } = await query.maybeSingle();

    if (fetchError) {
      console.error('Failed to check existing entry:', fetchError);
      return { success: false, error: 'DB Error' };
    }

    if (existing) {
      // Update
      const { error } = await supabase
        .from('work_entries')
        .update({
          parts_data: parts,
          company_id: companyId || null,
          updated_at: new Date().toISOString(),
          // status: 'draft', // REMOVED: Do not auto-reset status. Trust the caller or existing state.
        })
        .eq('id', existing.id);

      if (error) return { success: false, error: error.message };
    } else {
      // Insert
      const { error } = await supabase.from('work_entries').insert({
        user_id: userId,
        company_id: companyId || null,
        entry_date: date,
        parts_data: parts,
        status: 'draft',
      });

      if (error) return { success: false, error: error.message };
    }

    return { success: true };
  }

  /**
   * Update only the company ID of an entry (Move/Transfer)
   */
  async updateEntryCompany(
    entryId: string,
    companyId: string | null,
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.supabaseService.isAuthenticated()) {
      return { success: false, error: 'User not authenticated' };
    }

    const supabase = this.supabaseService.getClient();
    const { error } = await supabase
      .from('work_entries')
      .update({
        company_id: companyId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', entryId);

    if (error) {
      console.error('Failed to update entry company:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  /**
   * Update entry status (Manager/Approval Flow)
   */
  async updateEntryStatus(
    entryId: string,
    status: WorkEntryStatus,
    reviewNote?: string, // Optional note for rejection
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.supabaseService.isAuthenticated()) {
      return { success: false, error: 'Must be logged in' };
    }

    const supabase = this.supabaseService.getClient();

    // If status is 'disputed' or 'rejected', we might want to store the note
    // For now, let's assume 'entry_reviews' table exists or we add a field.
    // The previous implementation used 'entry_reviews'. Let's stick to that pattern if possible,
    // OR just update the status if that's all that is requested.

    const { error } = await supabase
      .from('work_entries')
      .update({ status })
      .eq('id', entryId);

    if (error) return { success: false, error: error.message };

    return { success: true };
  }

  /**
   * Create a dispute review record
   */
  async disputeEntry(
    entryId: string,
    reason: string,
  ): Promise<{ success: boolean; error?: string }> {
    const userId = this.supabaseService.user()?.id;
    if (!userId || !this.supabaseService.isManager()) {
      return { success: false, error: 'Not authorized' };
    }

    const supabase = this.supabaseService.getClient();

    // 1. Insert Review
    const { error: reviewError } = await supabase.from('entry_reviews').insert({
      entry_id: entryId,
      reviewer_id: userId,
      review_note: reason,
      original_parts_data: [], // Snapshot if needed
      reviewed_parts_data: [],
    });

    if (reviewError) {
      return { success: false, error: 'Failed to record dispute' };
    }

    // 2. Update Status
    return this.updateEntryStatus(entryId, 'disputed');
  }

  // --- Manager Fetch Methods ---

  async getCompanyWorkEntries(
    companyId: string,
    status?: WorkEntryStatus,
  ): Promise<{
    success: boolean;
    entries?: WorkEntry[];
    error?: string;
  }> {
    const supabase = this.supabaseService.getClient();
    let query = supabase
      .from('work_entries')
      .select(`*, profile:user_id(full_name)`)
      .eq('company_id', companyId)
      .order('entry_date', { ascending: false });

    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) return { success: false, error: error.message };

    return { success: true, entries: data as any };
  }

  /**
   * Subscribe to changes for a specific User (Global Session Scope)
   */
  subscribeToUserChanges(userId: string): void {
    if (this.userSubscription) return; // Already subscribed

    const supabase = this.supabaseService.getClient();
    this.userSubscription = supabase
      .channel(`user-entries:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'work_entries',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          this.entryUpdates$.next({
            type: 'user',
            id: userId,
            event: payload,
          });
        },
      )
      .subscribe();
  }

  unsubscribeFromUserChanges(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
      this.userSubscription = null;
    }
  }

  /**
   * Subscribe to changes for a specific Company (Page Scope)
   */
  subscribeToCompanyChanges(companyId: string): void {
    if (this.companySubscriptions.has(companyId)) return;

    const supabase = this.supabaseService.getClient();
    const sub = supabase
      .channel(`company-entries:${companyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'work_entries',
          filter: `company_id=eq.${companyId}`,
        },
        (payload) => {
          this.entryUpdates$.next({
            type: 'company',
            id: companyId,
            event: payload,
          });
        },
      )
      .subscribe();

    this.companySubscriptions.set(companyId, sub);
  }

  unsubscribeFromCompanyChanges(companyId: string): void {
    const sub = this.companySubscriptions.get(companyId);
    if (sub) {
      sub.unsubscribe();
      this.companySubscriptions.delete(companyId);
    }
  }

  private unsubscribeAll(): void {
    this.unsubscribeFromUserChanges();
    this.companySubscriptions.forEach((sub) => sub.unsubscribe());
    this.companySubscriptions.clear();
  }
}
