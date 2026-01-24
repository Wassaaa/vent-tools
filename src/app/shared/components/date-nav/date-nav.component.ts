import {
  Component,
  inject,
  computed,
  signal,
  viewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule, MatDatepicker } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { SessionService } from '@core/services';

/**
 * Compact date navigation component with prev/next arrows, Today button,
 * and tap-on-date to open full date picker.
 */
@Component({
  selector: 'app-date-nav',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    TranslocoModule,
  ],
  templateUrl: './date-nav.component.html',
  styleUrl: './date-nav.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateNavComponent {
  private readonly session = inject(SessionService);
  private readonly transloco = inject(TranslocoService);

  /** Reference to the hidden date picker */
  readonly picker = viewChild<MatDatepicker<Date>>('picker');

  /** Current work date */
  readonly workDate = this.session.workDate;

  /** Formatted date string */
  readonly formattedDate = computed(() => {
    const date = this.workDate();
    const lang = this.transloco.getActiveLang();
    
    // Use locale-aware formatting
    const locale = lang === 'fi' ? 'fi-FI' : lang === 'et' ? 'et-EE' : 'en-US';
    
    return date.toLocaleDateString(locale, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  });

  /** Navigate to previous day */
  goToPreviousDay(): void {
    const current = this.workDate();
    const prev = new Date(current);
    prev.setDate(prev.getDate() - 1);
    this.session.setWorkDate(prev);
  }

  /** Navigate to next day */
  goToNextDay(): void {
    const current = this.workDate();
    const next = new Date(current);
    next.setDate(next.getDate() + 1);
    this.session.setWorkDate(next);
  }

  /** Open the date picker */
  openDatePicker(): void {
    this.picker()?.open();
  }

  /** Handle date selection from picker */
  onDateSelected(date: Date | null): void {
    if (date) {
      date.setHours(0, 0, 0, 0);
      this.session.setWorkDate(date);
    }
  }
}
