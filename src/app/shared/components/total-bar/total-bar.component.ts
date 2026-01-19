import {
  Component,
  inject,
  output,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import { WorkLogService, PreferencesService, SessionService } from '@core/services';
import { DurationPipe } from '@shared/pipes/duration.pipe';

/**
 * Sticky bottom bar showing daily totals.
 * Tap to open work log sheet.
 * Long-press on price to edit NH rate.
 */
@Component({
  selector: 'app-total-bar',
  imports: [DecimalPipe, TranslocoModule, DurationPipe],
  templateUrl: './total-bar.component.html',
  styleUrl: './total-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TotalBarComponent {
  private readonly workLog = inject(WorkLogService);
  private readonly preferences = inject(PreferencesService);
  private readonly session = inject(SessionService);

  /** Emitted when user taps to open work log */
  readonly openLog = output<void>();

  /** Emitted when user long-presses on price */
  readonly editNhRate = output<void>();

  /** Entries for current date */
  private readonly todayEntries = computed(() => {
    const date = this.session.workDate();
    return this.workLog.getEntriesByDate(date);
  });

  /** Total norm hours for current date */
  readonly totalNormHours = computed(() => {
    return this.todayEntries().reduce((sum, e) => sum + e.normHours, 0);
  });

  /** Number of entries for current date */
  readonly entryCount = computed(() => this.todayEntries().length);

  /** Total price based on NH rate */
  readonly totalPrice = computed(() => {
    const hours = this.totalNormHours();
    const rate = this.preferences.nhRate();
    return hours * rate;
  });

  /** Has any entries */
  readonly hasEntries = computed(() => this.entryCount() > 0);

  /** Handle tap on the bar */
  onTap(): void {
    this.openLog.emit();
  }

  /** Handle long press on price area */
  private longPressTimer: ReturnType<typeof setTimeout> | null = null;

  onPricePointerDown(): void {
    this.longPressTimer = setTimeout(() => {
      this.editNhRate.emit();
    }, 600);
  }

  onPricePointerUp(): void {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  onPricePointerLeave(): void {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }
}
