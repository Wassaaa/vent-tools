import { Injectable, signal, computed, effect, inject, untracked } from '@angular/core';
import { Subject } from 'rxjs';

import { VentPart } from '@core/models';
import { SupabaseService } from './supabase.service';
import { WorkEntryService } from './work-entry.service';
import { PreferencesService } from './preferences.service';
import { SessionService } from './session.service';
import { CompanyService } from './company.service';

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
 * Helper to parse YYYY-MM-DD to a local Date at midnight
 */
export const fromLocalDateString = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export interface CompanyCollision {
  date: Date;
  oldCompanyId: string | null;
  oldCompanyName: string | null;
  newCompanyId: string | null;
  newCompanyName: string | null;
  pendingEntry: VentPart;
}

/**
 * Service for managing the work log (list of VentParts).
 * Provides CRUD operations and persistence to localStorage.
 * Coordinates sync with Supabase when online.
 */
@Injectable({ providedIn: 'root' })
export class WorkLogService {
  private supabaseService = inject(SupabaseService);
  private workEntryService = inject(WorkEntryService);
  private preferences = inject(PreferencesService);
  private session = inject(SessionService);
  private companyService = inject(CompanyService);

  /** The work log entries */
  readonly entries = signal<VentPart[]>(this.loadFromStorage());

  /** Collision event for UI to handle */
  readonly collision$ = new Subject<CompanyCollision>();

  /** Current work date */
  private readonly workDate = this.session.workDate;

  /** Entries for the currently selected day */
  readonly currentDayEntries = computed(() => {
    const targetDateStr = toLocalDateString(this.workDate());
    return this.entries().filter((entry) => toLocalDateString(entry.date) === targetDateStr);
  });

  /** 
   * Context for the current day.
   * Prioritizes entries' company, falls back to active company from settings.
   */
  readonly currentDayContext = computed(() => {
    const entries = this.currentDayEntries();
    const activeCompanyId = this.preferences.activeCompanyId();
    
    let id: string | null = null;
    let name: string | null = null;

    if (entries.length > 0) {
      // Use existing entries' context
      id = entries[0].companyId ?? null;
      name = entries[0].companyName ?? null;
    } else {
      // Empty day, use settings context
      id = activeCompanyId ?? null;
      name = this.companyService.getCompanyNameSync(id);
    }

    return { id, name };
  });

  /** Total norm hours across all entries */
  readonly totalNormHours = computed(() =>
    this.entries().reduce((sum, entry) => sum + entry.normHours, 0)
  );

  /** Number of entries */
  readonly entryCount = computed(() => this.entries().length);

  /** Flag for pending sync (future cloud integration) */
  readonly pendingSync = signal(false);

  constructor() {
    // Auto-persist changes to localStorage
    effect(() => {
      const entries = this.entries();
      this.saveToStorage(entries);
    });

    // Auto-sync when authenticated
    effect(() => {
      if (this.supabaseService.isAuthenticated()) {
        untracked(() => {
          this.syncWithCloud();
        });
      }
    });
  }

  /**
   * Sync local data with Supabase
   */
  private async syncWithCloud(): Promise<void> {
    this.pendingSync.set(true);
    const localEntries = this.entries();

    // 1. Push local entries to cloud (if any)
    if (localEntries.length > 0) {
      const result = await this.workEntryService.syncLocalParts(localEntries);
      if (!result.success) {
        console.error('Sync push failed:', result.error);
      }
    }

    // 2. Pull all entries from cloud
    try {
      const remoteEntries = await this.workEntryService.getAllEntries();
      const companiesResult = await this.workEntryService.fetchCompanies();
      
      const companyMap = new Map<string, string>();
      if (companiesResult.success && companiesResult.companies) {
        companiesResult.companies.forEach((c: any) => companyMap.set(c.id, c.name));
      }

      const mergedPartsMap = new Map<string, VentPart>();
      
      for (const entry of remoteEntries) {
        if (!entry.parts_data) continue;
        
        const parts = (entry.parts_data as any[]).map((p) => ({
          ...p,
          date: fromLocalDateString(entry.entry_date).getTime(), 
          companyId: entry.company_id ?? null,
          companyName: entry.company_id ? companyMap.get(entry.company_id) || 'Unknown Company' : null,
        }));
        
        parts.forEach(p => mergedPartsMap.set(p.id, p as VentPart));
      }

      const mergedParts = Array.from(mergedPartsMap.values());

      if (remoteEntries.length > 0 || localEntries.length === 0) {
         this.entries.set(mergedParts);
      }
      
    } catch (e) {
      console.error('Sync pull failed:', e);
    } finally {
      this.pendingSync.set(false);
    }
  }

  /**
   * Add a new entry to the work log.
   */
  addEntry(entry: VentPart, bypassCheck = false): void {
    const activeCompanyId = this.preferences.activeCompanyId() ?? null;
    const dateStr = toLocalDateString(entry.date);
    
    if (!bypassCheck) {
      const existingEntriesForDate = this.entries().filter(
        (e) => toLocalDateString(e.date) === dateStr
      );

      if (existingEntriesForDate.length > 0) {
        const existingCompanyId = existingEntriesForDate[0].companyId ?? null;
        if (existingCompanyId !== activeCompanyId) {
          const existingCompanyName = existingEntriesForDate[0].companyName ?? null;
          this.collision$.next({
            date: new Date(entry.date),
            oldCompanyId: existingCompanyId,
            oldCompanyName: existingCompanyName,
            newCompanyId: activeCompanyId,
            newCompanyName: null,
            pendingEntry: entry,
          });
          return;
        }
      }
    }

    this.processAddEntry(entry, activeCompanyId);
  }

  private async processAddEntry(entry: VentPart, companyId: string | null): Promise<void> {
    const companyName = await this.getCompanyName(companyId);
    const enrichedEntry = { 
      ...entry, 
      companyId: (entry.companyId !== undefined) ? entry.companyId : (companyId ?? null),
      companyName: (entry.companyName !== undefined) ? entry.companyName : (companyName ?? null)
    };

    this.entries.update((entries) => [...entries, enrichedEntry]);
    this.markPendingSync();
    this.pushDayToCloud(enrichedEntry.date, enrichedEntry.companyId);
  }

  async moveDateToCompany(date: Date, newCompanyId: string | null): Promise<void> {
    const dateStr = toLocalDateString(date);
    const companyName = await this.getCompanyName(newCompanyId);
    
    this.entries.update((entries) =>
      entries.map((e) => {
        if (toLocalDateString(e.date) === dateStr) {
          return { ...e, companyId: newCompanyId, companyName };
        }
        return e;
      })
    );

    this.markPendingSync();
    if (this.supabaseService.isAuthenticated()) {
      await this.pushDayToCloud(date, newCompanyId);
    }
  }

  async getCompanyName(id: string | null): Promise<string | null> {
    if (!id) return null;
    const result = await this.workEntryService.fetchCompanies();
    if (result.success && result.companies) {
      return result.companies.find(c => c.id === id)?.name ?? 'Unknown Company';
    }
    return 'Unknown Company';
  }

  removeEntry(id: string): void {
    const entryToRemove = this.entries().find((e) => e.id === id);
    if (!entryToRemove) return;

    this.entries.update((entries) => entries.filter((e) => e.id !== id));
    this.markPendingSync();
    this.pushDayToCloud(entryToRemove.date, entryToRemove.companyId);
  }

  updateEntry(id: string, updates: Partial<VentPart>): void {
    let updatedEntry: VentPart | undefined;

    this.entries.update((entries) =>
      entries.map((e) => {
        if (e.id === id) {
          updatedEntry = { ...e, ...updates };
          return updatedEntry;
        }
        return e;
      })
    );
    this.markPendingSync();

    if (updatedEntry) {
      this.pushDayToCloud(updatedEntry.date, updatedEntry.companyId);
    }
  }

  assignCompany(id: string, companyId: string | null, companyName?: string | null): void {
    const entry = this.entries().find(e => e.id === id);
    if (!entry) return;
    this.updateEntry(id, { companyId, companyName });
  }

  clearAll(): void {
    const affected = this.entries().map(e => ({ date: e.date, companyId: e.companyId }));
    this.entries.set([]);
    this.markPendingSync();

    if (this.supabaseService.isAuthenticated()) {
        const uniqueKeys = new Set(affected.map(a => `${toLocalDateString(a.date)}|${a.companyId}`));
        for (const key of uniqueKeys) {
            const [dateStr, companyId] = key.split('|');
            this.pushDayToCloud(dateStr, companyId === 'null' ? null : companyId);
        }
    }
  }

  reorderEntries(fromIndex: number, toIndex: number): void {
    let entry: VentPart | undefined;
    this.entries.update((entries) => {
      const result = [...entries];
      const [removed] = result.splice(fromIndex, 1);
      result.splice(toIndex, 0, removed);
      entry = removed;
      return result;
    });
    this.markPendingSync();
    if (entry) this.pushDayToCloud(entry.date, entry.companyId);
  }

  mergeDuplicates(): void {
    const affectedDates = new Set<number>();
    this.entries.update((entries) => {
      const merged = new Map<string, VentPart>();
      for (const entry of entries) {
        const key = `${entry.type}|${entry.subType ?? ''}|${entry.sizeDisplay}|${entry.companyId ?? ''}|${toLocalDateString(entry.date)}`;
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
        affectedDates.add(entry.date);
      }
      return Array.from(merged.values());
    });
    this.markPendingSync();
    for (const date of affectedDates) {
        this.pushDayToCloud(date);
    }
  }

  getEntriesByDate(date: Date): VentPart[] {
    const targetDateStr = toLocalDateString(date);
    return this.entries().filter((entry) => toLocalDateString(entry.date) === targetDateStr);
  }

  private async pushDayToCloud(dateStr: string | number | Date, companyId?: string | null): Promise<void> {
    if (!this.supabaseService.isAuthenticated()) return;

    const formattedDate = toLocalDateString(dateStr);
    if (companyId === undefined) {
      const existing = this.entries().find(e => toLocalDateString(e.date) === formattedDate);
      companyId = existing ? (existing.companyId ?? null) : (this.preferences.activeCompanyId() ?? null);
    }

    const dayEntries = this.entries().filter(
      (e) => toLocalDateString(e.date) === formattedDate && (e.companyId === companyId || (!e.companyId && !companyId))
    );

    const parts = dayEntries.map((e) => ({
      ...e,
      partType: e.type,
      size: e.sizeDisplay ? parseInt(e.sizeDisplay) : 0,
      amount: e.amount,
      conditions: [],
    }));

    await this.workEntryService.saveEntry(parts, companyId, formattedDate);
    this.pendingSync.set(false);
  }

  private markPendingSync(): void {
    this.pendingSync.set(true);
  }

  markSynced(): void {
    this.pendingSync.set(false);
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

  private saveToStorage(entries: VentPart[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (e) {
      console.error('Failed to save work log to storage:', e);
    }
  }
}
