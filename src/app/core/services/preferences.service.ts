import { Injectable, signal, effect, computed } from '@angular/core';

const STORAGE_KEY = 'vent_preferences';

export interface Preferences {
  workerName: string;
  nhRate: number;
  theme: 'light' | 'dark' | 'system';
  language: 'fi' | 'et' | 'en' | 'ru';
  historyRetentionDays: number;
  calculatorState: {
    round: { typeIndex: number; size: number };
    square: { typeIndex: number; width: number; height: number };
    machine: { typeIndex: number; subTypeIndex: number; size: number };
  };
}

const DEFAULT_PREFERENCES: Preferences = {
  workerName: 'Worker',
  nhRate: 19.1, // 2025 TES rate
  theme: 'system',
  language: 'fi',
  historyRetentionDays: 100,
  calculatorState: {
    round: { typeIndex: 0, size: 125 }, // Default to Pipe (index 0)
    square: { typeIndex: 0, width: 200, height: 200 }, // Default to Uninsulated (index 0)
    machine: { typeIndex: -1, subTypeIndex: 0, size: 1 },
  },
};

/**
 * Service for managing user preferences.
 * Stores settings like worker name, NH rate, theme, language, and calculator state.
 * Persists to localStorage with reactive signal-based state.
 */
@Injectable({ providedIn: 'root' })
export class PreferencesService {
  /** All preferences as a signal */
  private readonly prefsSignal = signal<Preferences>(this.loadPreferences());

  /** Worker name */
  readonly workerName = computed(() => this.prefsSignal().workerName);

  /** Norm Hour rate in euros */
  readonly nhRate = computed(() => this.prefsSignal().nhRate);

  /** Theme preference */
  readonly theme = computed(() => this.prefsSignal().theme);

  /** Language preference */
  readonly language = computed(() => this.prefsSignal().language);

  /** History retention in days */
  readonly historyRetentionDays = computed(() => this.prefsSignal().historyRetentionDays);

  /** Calculator state */
  readonly calculatorState = computed(() => this.prefsSignal().calculatorState);

  constructor() {
    // Auto-persist changes
    effect(() => {
      const prefs = this.prefsSignal();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    });
  }

  /** Get all preferences */
  getAll(): Preferences {
    return this.prefsSignal();
  }

  /** Update worker name */
  setWorkerName(name: string): void {
    this.updatePreference('workerName', name.trim() || DEFAULT_PREFERENCES.workerName);
  }

  /** Update NH rate */
  setNhRate(rate: number): void {
    if (rate > 0) {
      this.updatePreference('nhRate', rate);
    }
  }

  /** Update theme */
  setTheme(theme: 'light' | 'dark' | 'system'): void {
    this.updatePreference('theme', theme);
  }

  /** Update language */
  setLanguage(language: 'fi' | 'et' | 'en' | 'ru'): void {
    this.updatePreference('language', language);
  }

  /** Update history retention */
  setHistoryRetentionDays(days: number): void {
    if (days > 0 && days <= 365) {
      this.updatePreference('historyRetentionDays', days);
    }
  }

  /** Update calculator state */
  updateCalculatorState(
    category: 'round' | 'square' | 'machine',
    state: Partial<Preferences['calculatorState']['round'] | Preferences['calculatorState']['square'] | Preferences['calculatorState']['machine']>
  ): void {
    this.prefsSignal.update((prefs) => {
      const currentCategoryState = prefs.calculatorState[category];
      // Type assertion needed because TS doesn't know which category we are updating specifically here
      const updatedCategoryState = { ...currentCategoryState, ...state } as any; 
      
      return {
        ...prefs,
        calculatorState: {
          ...prefs.calculatorState,
          [category]: updatedCategoryState,
        },
      };
    });
  }


  /** Reset to defaults */
  resetToDefaults(): void {
    this.prefsSignal.set({ ...DEFAULT_PREFERENCES });
  }

  private updatePreference<K extends keyof Preferences>(key: K, value: Preferences[K]): void {
    this.prefsSignal.update(prefs => ({ ...prefs, [key]: value }));
  }

  private loadPreferences(): Preferences {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<Preferences>;
        // Deep merge calculator state to ensure structure exists if new keys added
        const mergedCalcState = { ...DEFAULT_PREFERENCES.calculatorState, ...(parsed.calculatorState || {}) };
        return { ...DEFAULT_PREFERENCES, ...parsed, calculatorState: mergedCalcState };
      }
    } catch {
      console.warn('Failed to load preferences, using defaults');
    }
    return { ...DEFAULT_PREFERENCES };
  }
}
