import { Injectable, signal, effect } from '@angular/core';

const STORAGE_KEYS = {
  WORKER_NAME: 'vent_worker_name',
  CURRENT_ROUTE: 'vent_current_route',
} as const;

/**
 * Service for managing user session data.
 * Persists worker name and route to localStorage.
 * Work date is always initialized to today.
 * Provides signals for reactive state management.
 */
@Injectable({ providedIn: 'root' })
export class SessionService {
  /** Current worker name */
  readonly workerName = signal(this.loadWorkerName());

  /** Current work date */
  readonly workDate = signal(this.loadWorkDate());

  /** Current route path */
  readonly currentRoute = signal(this.loadCurrentRoute());

  constructor() {
    // Auto-persist changes to localStorage
    effect(() => {
      const name = this.workerName();
      if (name) {
        localStorage.setItem(STORAGE_KEYS.WORKER_NAME, name);
      }
    });

    effect(() => {
      const route = this.currentRoute();
      if (route) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_ROUTE, route);
      }
    });
  }

  /** Update worker name */
  setWorkerName(name: string): void {
    this.workerName.set(name);
  }

  /** Update work date */
  setWorkDate(date: Date): void {
    this.workDate.set(date);
  }

  /** Update current route */
  setCurrentRoute(route: string): void {
    this.currentRoute.set(route);
  }

  /** Check if session has valid worker name */
  hasValidWorker(): boolean {
    return this.workerName().trim().length > 0;
  }

  private loadWorkerName(): string {
    return localStorage.getItem(STORAGE_KEYS.WORKER_NAME) ?? '';
  }

  private loadWorkDate(): Date {
    // Always start with today at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  private loadCurrentRoute(): string {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_ROUTE) ?? '/round';
  }
}
