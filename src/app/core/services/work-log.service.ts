import {
  computed,
  effect,
  inject,
  Injectable,
  resource,
  signal,
  untracked,
} from '@angular/core';

import { VentPart } from '@core/models';
import { PartData } from '../models/database.types';
import { CompanyService } from './company.service';
import { PreferencesService } from './preferences.service';
import { SessionService } from './session.service';
import { SupabaseService } from './supabase.service';
import { WorkEntryService } from './work-entry.service';

const STORAGE_KEY = 'vent_work_log';

/**
 * Helper to get local date string YYYY-MM-DD
 */
export const toLocalDateString = (date: Date | number | string): string => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Service for managing the work log.
 * Implements "Clean Break" logic:
 * - If Authenticated: Operations go directly to Cloud (WorkEntryService). Local storage is ignored/hidden.
 * - If Unauthenticated: Operations stay in LocalStorage.
 */
@Injectable({ providedIn: 'root' })
export class WorkLogService {
  private supabaseService = inject(SupabaseService);
  private workEntryService = inject(WorkEntryService);
  private preferences = inject(PreferencesService);
  private session = inject(SessionService);
  private companyService = inject(CompanyService);

  /**
   * Local entries (only relevant when unauthenticated)
   */
  readonly localEntries = signal<VentPart[]>([]);

  /** Current work date */
  private readonly workDate = this.session.workDate;

  /** Cloud Entry for current day (if authenticated) */
  readonly currentCloudEntry = resource({
    loader: async () => {
      const date = toLocalDateString(this.workDate());
      const userId = this.supabaseService.user()?.id;

      if (!userId) return null;
      // Fetch specific entry for this date
      return await this.workEntryService.getEntryByDate(date);
    },
  });

  constructor() {
    // 1. Initialize Local Entries
    this.localEntries.set(this.loadFromStorage());

    // 2. Auto-persist Local Changes
    effect(() => {
      const entries = this.localEntries();
      this.saveToStorage(entries);
    });

    // 3. Trigger Cloud Reload on Dependency Change
    effect(() => {
      // Track dependencies
      this.workDate();
      this.supabaseService.user();
      this.preferences.activeCompanyId(); // Reload if user switches 'represented' company

      // Reload resource
      untracked(() => {
        this.currentCloudEntry.reload();
      });
    });
  }

  /**
   * Add a new entry to the work log.
   */
  async addEntry(entry: VentPart): Promise<void> {
    if (this.supabaseService.isAuthenticated()) {
      await this.addCloudEntry(entry);
    } else {
      this.addLocalEntry(entry);
    }
  }

  /**
   * Remove an entry
   */
  async removeEntry(id: string): Promise<void> {
    if (this.supabaseService.isAuthenticated()) {
      await this.removeCloudPart(id);
    } else {
      this.removeLocalEntry(id);
    }
  }

  /**
   * Clear all entries for current date
   */
  async clearDay(): Promise<void> {
    if (this.supabaseService.isAuthenticated()) {
      await this.clearCloudDay();
    } else {
      this.clearLocalDay();
    }
  }

  // --- Local Logic ---

  private addLocalEntry(entry: VentPart): void {
    this.localEntries.update((list) => [...list, entry]);
  }

  private removeLocalEntry(id: string): void {
    this.localEntries.update((list) => list.filter((e) => e.id !== id));
  }

  private clearLocalDay(): void {
    const targetDateStr = toLocalDateString(this.workDate());
    this.localEntries.update((list) =>
      list.filter((e) => toLocalDateString(e.date) !== targetDateStr),
    );
  }

  private loadFromStorage(): VentPart[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load work log from storage:', e);
    }
    return [];
  }

  /**
   * Reassign a cloud entry for a specific date to a different company.
   * "Move to Company" feature (cloud-only).
   */
  async reassignEntryToCompany(
    date: Date | string | number,
    companyId: string | null,
  ): Promise<void> {
    if (!this.supabaseService.isAuthenticated()) return;

    const dateStr = toLocalDateString(date);
    const currentEntry = await this.workEntryService.getEntryByDate(dateStr);

    if (!currentEntry) {
      console.warn('No cloud entry found to reassign for date:', dateStr);
      return;
    }

    // Just update the company_id of the existing entry
    await this.workEntryService.updateEntryCompany(currentEntry.id, companyId);

    // Refresh the resource
    this.currentCloudEntry.reload();
  }

  private saveToStorage(entries: VentPart[]): void {
    // STRICT SEPARATION: Never write to local storage if authenticated.
    if (this.supabaseService.isAuthenticated()) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (e) {
      console.error('Failed to save work log to storage:', e);
    }
  }

  /**
   * Unified display list for the current day.
   * - If Authenticated: Returns Cloud Entries for date.
   * - If Unauthenticated: Returns Local Entries for date.
   */
  readonly currentDisplayEntries = computed<VentPart[]>(() => {
    if (this.supabaseService.isAuthenticated()) {
      const cloud = this.currentCloudEntry.value();
      if (cloud && cloud.parts_data) {
        return (cloud.parts_data as PartData[]).map(
          (p) =>
            ({
              id: p.id || '',
              type: p.partType,
              subType: p['subType'],
              size: p.size || 0,
              sizeDisplay: p.size ? p.size.toString() : '',
              amount: p.amount,
              normHours: p.normHours || 0,
              date: new Date(cloud.entry_date), // Convert string to Date
              unit: 'kpl', // Default unit
              // Add other fields if needed for VentPart
            }) as unknown as VentPart,
        );
      }
      return [];
    } else {
      return this.currentDayLocalEntries();
    }
  });

  /**
   * Current context for the work log.
   */
  readonly currentContext = computed(() => {
    if (this.supabaseService.isAuthenticated()) {
      const entry = this.currentCloudEntry.value();
      this.companyService.userCompanies(); // Dependency

      // If entry exists, trust its company_id (even if null/Personal)
      // If no entry, default to Active Company preference
      const companyId = entry
        ? entry.company_id
        : this.preferences.activeCompanyId();

      if (companyId) {
        const name = this.companyService.getCompanyNameSync(companyId);
        return { id: companyId, name: name || 'Company', isCloud: true };
      }
    }
    // Local context
    return { id: null, name: '', isCloud: false };
  });

  /** Entries for the currently selected day (Local Only) */
  readonly currentDayLocalEntries = computed(() => {
    const targetDateStr = toLocalDateString(this.workDate());
    return this.localEntries().filter(
      (entry) => toLocalDateString(entry.date) === targetDateStr,
    );
  });

  // --- Cloud Logic ---

  private async addCloudEntry(part: VentPart): Promise<void> {
    const dateStr = toLocalDateString(part.date);
    const companyId = this.preferences.activeCompanyId();

    // Convert VentPart to PartData
    const newPartData: PartData = {
      ...part,
      partType: part.type,
      size: part.sizeDisplay ? parseInt(part.sizeDisplay) : 0,
      amount: part.amount,
      conditions: [],
      normHours: part.normHours,
    };

    // Get existing cloud entry parts
    const currentEntry = this.currentCloudEntry.value();
    const existingParts = (currentEntry?.parts_data as PartData[]) || [];

    // Append new part
    const updatedParts = [...existingParts, newPartData];

    // Save
    await this.workEntryService.saveEntry(updatedParts, companyId, dateStr);

    // Reload resource to update UI
    this.currentCloudEntry.reload();
  }

  private async removeCloudPart(partId: string): Promise<void> {
    const currentEntry = this.currentCloudEntry.value();
    if (!currentEntry) return;

    const existingParts = (currentEntry.parts_data as PartData[]) || [];
    // Note: We need to cast 'p' to check ID because PartData interface might be loose
    const updatedParts = existingParts.filter((p: any) => p.id !== partId);

    await this.workEntryService.saveEntry(
      updatedParts,
      currentEntry.company_id,
      currentEntry.entry_date,
    );
    this.currentCloudEntry.reload();
  }

  private async clearCloudDay(): Promise<void> {
    const currentEntry = this.currentCloudEntry.value();
    if (!currentEntry) return;

    // Send empty list to clear
    await this.workEntryService.saveEntry(
      [],
      currentEntry.company_id,
      currentEntry.entry_date,
    );
    this.currentCloudEntry.reload();
  }

  /** Merge duplicates (Local Only implementation for now) */
  mergeLocalDuplicates(): void {
    this.localEntries.update((entries) => {
      const merged = new Map<string, VentPart>();
      for (const entry of entries) {
        const key = `${entry.type}|${entry.subType ?? ''}|${entry.sizeDisplay}|${toLocalDateString(entry.date)}`;
        if (merged.has(key)) {
          const existing = merged.get(key)!;
          const nhPerUnit = existing.normHours / existing.amount;
          merged.set(key, {
            ...existing,
            amount: existing.amount + entry.amount,
            normHours: (existing.amount + entry.amount) * nhPerUnit,
          });
        } else {
          merged.set(key, { ...entry });
        }
      }
      return Array.from(merged.values());
    });
  }
}
