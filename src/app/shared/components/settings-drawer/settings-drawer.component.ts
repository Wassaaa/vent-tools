import {
  Component,
  inject,
  input,
  output,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { PreferencesService, ThemeService } from '@core/services';

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
  ],
  templateUrl: './settings-drawer.component.html',
  styleUrl: './settings-drawer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsDrawerComponent {
  private readonly preferences = inject(PreferencesService);
  private readonly theme = inject(ThemeService);
  private readonly transloco = inject(TranslocoService);

  /** Is drawer open */
  isOpen = input<boolean>(false);

  /** Emitted when close is requested */
  readonly closeDrawer = output<void>();

  /** Local form values */
  readonly workerName = signal(this.preferences.workerName());
  readonly nhRate = signal(this.preferences.nhRate());

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

  /** Close the drawer */
  close(): void {
    this.closeDrawer.emit();
  }
}
