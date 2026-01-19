import { Injectable, signal, computed, effect } from '@angular/core';

import { VentPart } from '@core/models';

const STORAGE_KEY = 'vent_work_log';

/**
 * Service for managing the work log (list of VentParts).
 * Provides CRUD operations and persistence to localStorage.
 * Prepared for future cloud sync integration.
 */
@Injectable({ providedIn: 'root' })
export class WorkLogService {
  /** The work log entries */
  readonly entries = signal<VentPart[]>(this.loadFromStorage());

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
  }

  /**
   * Add a new entry to the work log.
   */
  addEntry(entry: VentPart): void {
    this.entries.update((entries) => [...entries, entry]);
    this.markPendingSync();
  }

  /**
   * Remove an entry by ID.
   */
  removeEntry(id: string): void {
    this.entries.update((entries) => entries.filter((e) => e.id !== id));
    this.markPendingSync();
  }

  /**
   * Update an existing entry.
   */
  updateEntry(id: string, updates: Partial<VentPart>): void {
    this.entries.update((entries) =>
      entries.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
    this.markPendingSync();
  }

  /**
   * Clear all entries.
   */
  clearAll(): void {
    this.entries.set([]);
    this.markPendingSync();
  }

  /**
   * Reorder entries (for drag-drop).
   */
  reorderEntries(fromIndex: number, toIndex: number): void {
    this.entries.update((entries) => {
      const result = [...entries];
      const [removed] = result.splice(fromIndex, 1);
      result.splice(toIndex, 0, removed);
      return result;
    });
    this.markPendingSync();
  }

  /**
   * Merge duplicate entries (same type + sizeDisplay).
   * Combines amounts and recalculates norm hours.
   */
  mergeDuplicates(): void {
    this.entries.update((entries) => {
      const merged = new Map<string, VentPart>();

      for (const entry of entries) {
        const key = `${entry.type}|${entry.subType ?? ''}|${entry.sizeDisplay}`;

        if (merged.has(key)) {
          const existing = merged.get(key)!;
          // Calculate NH per unit from the existing entry
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
    this.markPendingSync();
  }

  /**
   * Get entries filtered by date.
   */
  getEntriesByDate(date: Date): VentPart[] {
    const targetTime = new Date(date);
    targetTime.setHours(0, 0, 0, 0);
    const targetTimestamp = targetTime.getTime();

    return this.entries().filter((entry) => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === targetTimestamp;
    });
  }

  /**
   * Hook for future cloud sync integration.
   * Called after any modification to the work log.
   */
  private markPendingSync(): void {
    this.pendingSync.set(true);
    // Future: trigger debounced sync to cloud
  }

  /**
   * Hook for cloud sync completion.
   */
  markSynced(): void {
    this.pendingSync.set(false);
  }

  private loadFromStorage(): VentPart[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
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
