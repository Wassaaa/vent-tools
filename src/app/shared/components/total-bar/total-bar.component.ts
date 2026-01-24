import {
  Component,
  inject,
  output,
  computed,
  signal,
  effect,
  untracked,
  ChangeDetectionStrategy,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { trigger, transition, style, animate, query } from '@angular/animations';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { WorkLogService, PreferencesService, SessionService, toLocalDateString } from '@core/services';
import { DurationPipe } from '@shared/pipes/duration.pipe';

/**
 * Sticky bottom bar showing daily totals and recent activity.
 * Tap to open work log sheet.
 */
@Component({
  selector: 'app-total-bar',
  imports: [DecimalPipe, TranslocoModule, DurationPipe],
  templateUrl: './total-bar.component.html',
  styleUrl: './total-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('listAnimation', [
      transition('* => *', [
        // 1. Queue Exit (Rightmost/Oldest item)
        // We set position absolute to remove it from layout flow immediately.
        query(':leave', [
          style({ 
            position: 'absolute', 
            right: 0, // Anchor to right side to prevent jumping
            zIndex: 0,
            opacity: 1 
          }),
          animate('200ms ease-in', 
            style({ 
              transform: 'translateY(100%) scale(0.9)', 
              opacity: 0 
            })
          ),
        ], { optional: true }),

        // 2. Queue Entry (Leftmost/Newest item)
        query(':enter', [
          style({ 
            width: '0px', 
            opacity: 0, 
            transform: 'translate(50px, -300px) scale(0.5) rotate(15deg)', // Start near "Add" button
            overflow: 'hidden',
            margin: 0,
            padding: 0
          }),
          // Expand width to push neighbors
          animate('300ms cubic-bezier(0.2, 0.0, 0.2, 1)', 
            style({ 
              width: '*', 
              margin: '*', 
              padding: '*',
              opacity: 1
            })
          ),
          // Land the "throw" exactly in the center
          animate('400ms cubic-bezier(0.34, 1.56, 0.64, 1)', 
            style({ 
              transform: 'translate(0, 0) scale(1) rotate(0deg)'
            })
          )
        ], { optional: true }),
      ]),
    ]),
  ],
})
export class TotalBarComponent {
  private readonly workLog = inject(WorkLogService);
  private readonly preferences = inject(PreferencesService);
  private readonly session = inject(SessionService);
  private readonly transloco = inject(TranslocoService);

  /** Emitted when user taps to open work log */
  readonly openLog = output<void>();

  /** Emitted when user long-presses on price */
  readonly editNhRate = output<void>();

  /** Context from service */
  readonly dayContext = this.workLog.currentDayContext;

  /** Entries for current date */
  readonly todayEntries = this.workLog.currentDayEntries;

  /** Disable all animations during date changes or initial load */
  readonly animationsDisabled = signal(true);
  private lastDate = signal<string | null>(null);
  private lastCount = 0;

  constructor() {
    effect(() => {
      const entries = this.todayEntries();
      const date = toLocalDateString(this.session.workDate());
      
      untracked(() => {
        // If date changed, keep animations disabled
        if (date !== this.lastDate()) {
          this.lastDate.set(date);
          this.animationsDisabled.set(true);
          this.lastCount = entries.length;
          return;
        }

        // If entries increased on the SAME date, enable animations for this cycle
        if (entries.length > this.lastCount) {
          this.animationsDisabled.set(false);
          this.animationTrigger.update(v => v + 1);
        } else {
          // If items were removed or same, we might still want shift animations 
          // but let's stick to additions for now to keep it clean
          this.animationsDisabled.set(true);
        }
        
        this.lastCount = entries.length;
      });
    });
  }

  /** Latest 3 entries for preview */
  readonly latestEntries = computed(() => {
    return this.todayEntries().slice(-3).reverse();
  });

  /** Incrementing trigger for animations */
  readonly animationTrigger = signal(0);

  /** Total norm hours for current date */
  readonly totalNormHours = computed(() => {
    return this.todayEntries().reduce((sum, e) => sum + e.normHours, 0);
  });

  /** Total price based on NH rate */
  readonly totalPrice = computed(() => {
    const hours = this.totalNormHours();
    const rate = this.preferences.nhRate();
    return hours * rate;
  });

  /** Has any entries */
  readonly hasEntries = computed(() => this.todayEntries().length > 0);

  /** Format part type for small tag */
  formatType(type: string): string {
    const translated = this.transloco.translate(type);
    if (translated === type) {
      return type.split('.').pop() || type;
    }
    return translated;
  }

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
