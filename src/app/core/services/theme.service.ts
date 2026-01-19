import { Injectable, signal, effect, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PreferencesService } from './preferences.service';

export type ThemeMode = 'light' | 'dark';

/**
 * Service for managing application theme (dark/light mode).
 * 
 * Applies the 'dark-theme' class to the html element to switch themes.
 * The Sass theme file uses this class to apply Cyan+Orange colors in dark mode.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly preferences = inject(PreferencesService);

  /** System preference for dark mode */
  private readonly systemPrefersDark = signal(this.getSystemPreference());

  /** Resolved theme mode (light or dark) */
  readonly resolvedTheme = computed<ThemeMode>(() => {
    const pref = this.preferences.theme();
    if (pref === 'system') {
      return this.systemPrefersDark() ? 'dark' : 'light';
    }
    return pref;
  });

  /** Is dark mode active */
  readonly isDark = computed(() => this.resolvedTheme() === 'dark');

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      // Listen for system theme changes
      this.listenToSystemTheme();

      // Apply theme class to html element
      effect(() => {
        const theme = this.resolvedTheme();
        this.applyTheme(theme);
      });
    }
  }

  /** Toggle between light and dark (sets explicit preference) */
  toggle(): void {
    const current = this.resolvedTheme();
    this.preferences.setTheme(current === 'dark' ? 'light' : 'dark');
  }

  /** Set theme to light */
  setLight(): void {
    this.preferences.setTheme('light');
  }

  /** Set theme to dark */
  setDark(): void {
    this.preferences.setTheme('dark');
  }

  /** Set theme to follow system preference */
  setSystem(): void {
    this.preferences.setTheme('system');
  }

  private getSystemPreference(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  }

  private listenToSystemTheme(): void {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
      this.systemPrefersDark.set(e.matches);
    });
  }

  private applyTheme(theme: ThemeMode): void {
    const html = document.documentElement;
    
    if (theme === 'dark') {
      html.classList.add('dark-theme');
    } else {
      html.classList.remove('dark-theme');
    }
  }
}
