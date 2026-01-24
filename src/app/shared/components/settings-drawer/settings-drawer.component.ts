import {
  Component,
  inject,
  input,
  output,
  signal,
  computed,
  effect,
  ChangeDetectionStrategy,
  untracked,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { PreferencesService, ThemeService, SupabaseService, CompanyService } from '@core/services';
import type { Company } from '@core/models';

import { SideDrawerComponent } from '../side-drawer/side-drawer.component';

/**
 * Settings drawer for user preferences.
 * Contains worker name, NH rate, theme toggle, and language selection.
 */
@Component({
  selector: 'app-settings-drawer',
  imports: [
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    TranslocoModule,
    SideDrawerComponent,
  ],
  templateUrl: './settings-drawer.component.html',
  styleUrl: './settings-drawer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsDrawerComponent {
  private readonly preferences = inject(PreferencesService);
  private readonly theme = inject(ThemeService);
  private readonly transloco = inject(TranslocoService);
  private readonly supabase = inject(SupabaseService);
  private readonly companyService = inject(CompanyService);

  /** Is drawer open */
  isOpen = input<boolean>(false);

  /** Emitted when close is requested */
  readonly closeDrawer = output<void>();

  /** Auth state */
  readonly isAuthenticated = this.supabase.isAuthenticated;
  readonly profile = this.supabase.profile;

  /** Local form values */
  readonly workerName = signal(this.preferences.workerName());
  readonly nhRate = signal(this.preferences.nhRate());

  /** Companies list */
  readonly companies = signal<Company[]>([]);
  readonly activeCompanyId = this.preferences.activeCompanyId;

  constructor() {
    // Sync worker name with profile when authenticated
    effect(() => {
      const profile = this.profile();
      if (this.isAuthenticated() && profile?.full_name) {
        untracked(() => {
          this.workerName.set(profile.full_name);
          this.preferences.setWorkerName(profile.full_name);
        });
      }
    });

    // Load companies when authenticated
    effect(() => {
      if (this.isAuthenticated() && this.isOpen()) {
        this.loadCompanies();
      }
    });
  }

  private async loadCompanies(): Promise<void> {
    const result = await this.companyService.getUserCompanies();
    if (result.success && result.companies) {
      this.companies.set(result.companies);
    }
  }

  /** Theme state */
  readonly isDarkMode = this.theme.isDark;

  /** Available languages */
  readonly languages = [
    { value: 'fi', label: 'Suomi' },
    { value: 'et', label: 'Eesti' },
    { value: 'en', label: 'English' },
    { value: 'ru', label: 'Русский' },
  ] as const;

  /** Current language */
  get currentLanguage(): string {
    return this.preferences.language();
  }

  /** Save worker name */
  saveWorkerName(): void {
    this.preferences.setWorkerName(this.workerName());
  }

  /** Save NH rate */
  saveNhRate(): void {
    const rate = this.nhRate();
    if (rate > 0) {
      this.preferences.setNhRate(rate);
    }
  }

  /** Toggle dark mode */
  toggleTheme(): void {
    this.theme.toggle();
  }

  /** Set light/dark/system theme */
  setTheme(theme: 'light' | 'dark' | 'system'): void {
    this.preferences.setTheme(theme);
  }

  /** Change language */
  setLanguage(lang: string): void {
    const validLang = lang as 'fi' | 'et' | 'en' | 'ru';
    this.preferences.setLanguage(validLang);
    this.transloco.setActiveLang(validLang);
  }

  /** Set active company */
  setActiveCompany(id: string | null): void {
    this.preferences.setActiveCompanyId(id);
  }

  /** Close the drawer */
  close(): void {
    this.closeDrawer.emit();
  }
}
