import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  computed,
  effect,
  untracked,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { PreferencesService, ThemeService, SupabaseService, WorkLogService } from '@core/services';
import { AuthDrawerComponent } from '@shared/components/auth-drawer/auth-drawer.component';
import { DateNavComponent } from '@shared/components/date-nav/date-nav.component';
import { SettingsDrawerComponent } from '@shared/components/settings-drawer/settings-drawer.component';
import { TotalBarComponent } from '@shared/components/total-bar/total-bar.component';
import { WorkLogSheetComponent } from '@shared/components/work-log-sheet/work-log-sheet.component';

interface NavTab {
  path: string;
  labelKey: string;
  icon: string;
}

/**
 * Root component with mobile-first layout.
 * - Minimal header with settings toggle
 * - Date navigation row
 * - Tab navigation
 * - Router outlet for calculators
 * - Sticky total bar at bottom
 * - Settings drawer (slide from right)
 * - Work log bottom sheet
 */
@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    TranslocoModule,
    DateNavComponent,
    TotalBarComponent,
    SettingsDrawerComponent,
    WorkLogSheetComponent,
    AuthDrawerComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly themeService = inject(ThemeService);
  private readonly preferences = inject(PreferencesService);
  private readonly transloco = inject(TranslocoService);
  private readonly supabaseService = inject(SupabaseService);
  private readonly workLog = inject(WorkLogService);

  constructor() {
    // Restore language from preferences
    const savedLang = this.preferences.language();
    if (savedLang) {
      this.transloco.setActiveLang(savedLang);
    }

    // Reset worker name on logout
    effect(() => {
      if (!this.supabaseService.isAuthenticated()) {
        untracked(() => {
          this.preferences.setWorkerName('Worker');
        });
      }
    });

    // Handle company context collisions
    this.workLog.collision$.pipe(takeUntilDestroyed()).subscribe(async (collision) => {
      const oldName = collision.oldCompanyName || this.transloco.translate('workLog.personalWork');
      const newName = (await this.workLog.getCompanyName(collision.newCompanyId)) || this.transloco.translate('workLog.personalWork');

      const confirmed = confirm(
        this.transloco.translate('workLog.moveConfirm', {
          old: oldName,
          new: newName,
        }),
      );

      if (confirmed) {
        await this.workLog.moveDateToCompany(
          collision.date,
          collision.newCompanyId,
        );
        this.workLog.addEntry(collision.pendingEntry, true); // Bypass check
      }
    });
  }

  /** Navigation tabs */
  readonly navTabs: NavTab[] = [
    { path: '/round', labelKey: 'nav.round', icon: 'radio_button_unchecked' },
    { path: '/square', labelKey: 'nav.square', icon: 'crop_square' },
    {
      path: '/machine',
      labelKey: 'nav.machine',
      icon: 'precision_manufacturing',
    },
  ];

  /** Available languages */
  readonly languages = [
    { value: 'fi', label: 'Suomi' },
    { value: 'et', label: 'Eesti' },
    { value: 'en', label: 'English' },
    { value: 'ru', label: 'Русский' },
  ] as const;

  /** Is settings drawer open */
  readonly settingsOpen = signal(false);

  /** Is work log sheet open */
  readonly workLogOpen = signal(false);

  /** Is auth drawer open */
  readonly authOpen = signal(false);

  /** Any drawer open */
  readonly anyDrawerOpen = computed(() => this.settingsOpen() || this.authOpen() || this.workLogOpen());

  /** Is manager user */
  readonly isManager = this.supabaseService.isManager;

  /** Worker name from preferences */
  readonly workerName = this.preferences.workerName;

  /** Capped worker name for display in header */
  readonly workerNameDisplay = computed(() => {
    const name = this.workerName();
    const maxLen = 12;
    return name.length > maxLen ? name.substring(0, maxLen - 2) + '..' : name;
  });

  /** Current theme mode */
  readonly isDarkMode = this.themeService.isDark;

  /** Current language */
  readonly currentLanguage = this.preferences.language;

  /** Set language */
  setLanguage(lang: string): void {
    const validLang = lang as 'fi' | 'et' | 'en' | 'ru';
    this.preferences.setLanguage(validLang);
    this.transloco.setActiveLang(validLang);
  }

  /** Close all side/bottom drawers */
  closeAllDrawers(): void {
    this.settingsOpen.set(false);
    this.authOpen.set(false);
    this.workLogOpen.set(false);
  }

  /** Open settings drawer */
  openSettings(): void {
    this.authOpen.set(false);
    this.workLogOpen.set(false);
    this.settingsOpen.set(true);
  }

  /** Close settings drawer */
  closeSettings(): void {
    this.settingsOpen.set(false);
  }

  /** Open work log sheet */
  openWorkLog(): void {
    this.settingsOpen.set(false);
    this.authOpen.set(false);
    this.workLogOpen.set(true);
  }

  /** Close work log sheet */
  closeWorkLog(): void {
    this.workLogOpen.set(false);
  }

  /** Open auth drawer */
  openAuth(): void {
    this.settingsOpen.set(false);
    this.workLogOpen.set(false);
    this.authOpen.set(true);
  }

  /** Close auth drawer */
  closeAuth(): void {
    this.authOpen.set(false);
  }

  /** Toggle theme */
  toggleTheme(): void {
    this.themeService.toggle();
  }

  /** Handle NH rate edit request (long-press on price) */
  onEditNhRate(): void {
    // Open settings to NH rate field
    this.openSettings();
  }
}
