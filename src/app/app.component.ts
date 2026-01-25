import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

import {
  CompanyService,
  PreferencesService,
  SessionService,
  SupabaseService,
  ThemeService,
  WorkLogService,
} from '@core/services';
import { AuthDrawerComponent } from '@shared/components/auth-drawer/auth-drawer.component';
import { DailyWorkSheetComponent } from '@shared/components/daily-work-sheet/daily-work-sheet.component';
import { DateNavComponent } from '@shared/components/date-nav/date-nav.component';
import { HeaderBtnComponent } from '@shared/components/header-btn/header-btn.component';
import { SettingsDrawerComponent } from '@shared/components/settings-drawer/settings-drawer.component';
import { TotalBarComponent } from '@shared/components/total-bar/total-bar.component';

interface NavTab {
  path: string;
  labelKey: string;
  icon: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    TranslocoModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTabsModule,
    AuthDrawerComponent,
    DateNavComponent,
    SettingsDrawerComponent,
    TotalBarComponent,
    DailyWorkSheetComponent,
    HeaderBtnComponent,
  ],
})
export class AppComponent {
  private readonly themeService = inject(ThemeService);
  private readonly preferences = inject(PreferencesService);
  private readonly transloco = inject(TranslocoService);
  private readonly supabaseService = inject(SupabaseService);
  private readonly workLog = inject(WorkLogService);
  private readonly companyService = inject(CompanyService);
  private readonly session = inject(SessionService);
  private readonly snackBar = inject(MatSnackBar);

  // Compute inputs for DailyWorkSheet
  readonly localEntries = computed(() => this.workLog.currentDayLocalEntries());
  readonly cloudEntry = computed(
    () => this.workLog.currentCloudEntry.value() ?? null,
  );

  // Context Name (Local: Personal Work, Cloud: Company Name)
  readonly sheetContext = computed(() => {
    const context = this.workLog.currentContext();
    return context.name || this.transloco.translate('workLog.personalWork');
  });

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

    // Handle company context collisions (Legacy logic - can be removed or kept for safety)
    // Removed to align with "Clean Break" strategy where we don't merge local to cloud automatically
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
  readonly anyDrawerOpen = computed(
    () => this.settingsOpen() || this.authOpen() || this.workLogOpen(),
  );

  /** Is manager user */
  readonly isManager = this.supabaseService.isManager;

  /** Is authenticated user */
  readonly isAuthenticated = this.supabaseService.isAuthenticated;

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

  /** Active company name for move logic */
  readonly activeCompanyName = computed(() => {
    const id = this.preferences.activeCompanyId();
    this.companyService.userCompanies(); // Dependency for reactive naming
    if (!id) return null;
    return this.companyService.getCompanyNameSync(id);
  });

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

  /** Toggle settings drawer */
  openSettings(): void {
    if (this.settingsOpen()) {
      this.closeSettings();
    } else {
      this.closeAllDrawers();
      this.settingsOpen.set(true);
    }
  }

  /** Close settings drawer */
  closeSettings(): void {
    this.settingsOpen.set(false);
  }

  /** Toggle work log sheet */
  openWorkLog(): void {
    if (this.workLogOpen()) {
      this.closeWorkLog();
    } else {
      this.closeAllDrawers();
      this.workLogOpen.set(true);
    }
  }

  /** Close work log sheet */
  closeWorkLog(): void {
    this.workLogOpen.set(false);
  }

  // Wrapper actions for sheet
  handleDeleteEntry(id: string): void {
    this.workLog.removeEntry(id);
  }

  handleClearAll(): void {
    this.workLog.clearDay();
  }

  handleRevise(): void {
    // Revise logic implies we are editing the cloud entry.
    // For now, just close the sheet so user can edit.
    // In future, maybe populate local state from cloud?
    this.closeWorkLog();
  }

  async handleMoveToCloud(): Promise<void> {
    const activeId = this.preferences.activeCompanyId();
    if (!activeId) {
      this.snackBar.open(
        this.transloco.translate('workLog.noCompanySelected'),
        this.transloco.translate('common.close'),
        { duration: 3000 },
      );
      return;
    }

    const date = this.session.workDate();
    await this.workLog.reassignEntryToCompany(date, activeId);

    const companyName = this.activeCompanyName() || 'Company';
    this.snackBar.open(
      this.transloco.translate('workLog.moveSuccess', { name: companyName }),
      this.transloco.translate('common.close'),
      { duration: 3000 },
    );
  }

  handleUpdateAmount(event: { id: string; amount: number }): void {
    this.workLog.updatePartAmount(event.id, event.amount);
  }

  /** Toggle auth drawer */
  openAuth(): void {
    if (this.authOpen()) {
      this.closeAuth();
    } else {
      this.closeAllDrawers();
      this.authOpen.set(true);
    }
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
