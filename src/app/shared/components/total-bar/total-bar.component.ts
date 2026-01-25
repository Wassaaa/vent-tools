import {
  AnimationCallbackEvent,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  output,
  viewChild,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  FlyingTagService,
  PreferencesService,
  SessionService,
  toLocalDateString,
  WorkLogService,
} from '@core/services';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { DurationPipe } from '@shared/pipes/duration.pipe';
import { combineLatest } from 'rxjs';
import { map, pairwise, startWith } from 'rxjs/operators';

/**
 * Sticky bottom bar showing daily totals and recent activity.
 * Tap to open work log sheet.
 */
@Component({
  selector: 'app-total-bar',
  imports: [TranslocoModule, DurationPipe],
  templateUrl: './total-bar.component.html',
  styleUrl: './total-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  /* Animations handled imperatively via FlyingTagService and WAAPI */
})
export class TotalBarComponent {
  private readonly workLog = inject(WorkLogService);
  private readonly preferences = inject(PreferencesService);
  private readonly session = inject(SessionService);
  private readonly transloco = inject(TranslocoService);
  private readonly flyingTagService = inject(FlyingTagService);

  /** Container for recent activity tags - target for flying animations */
  readonly recentActivityContainer =
    viewChild<ElementRef<HTMLElement>>('recentActivity');

  /** Emitted when user taps to open work log */
  readonly openLog = output<void>();

  /** Emitted when user long-presses on price */
  readonly editNhRate = output<void>();

  /**
   * Unified display list for TotalBar (from Service)
   */
  readonly displayEntries = this.workLog.currentDisplayEntries;

  /** Context from service */
  readonly dayContext = this.workLog.currentContext;

  /**
   * View Model to sync animation state with data changes.
   * We need to know IF we should animate *before* the view updates.
   * Effect-based state is too late (runs after render).
   */
  readonly viewModel = toSignal(
    combineLatest([
      toObservable(this.workLog.currentDisplayEntries),
      toObservable(this.session.workDate),
    ]).pipe(
      startWith([[], new Date()] as const),
      pairwise(),
      map(([prev, curr]) => {
        const [prevEntries, prevDate] = prev;
        const [currEntries, currDate] = curr;

        const dateChanged =
          toLocalDateString(prevDate as Date) !==
          toLocalDateString(currDate as Date);

        // Animate ONLY if:
        // 1. Date is the same
        // 2. An item was Added (length increased)
        // (We can assume removal implies no strict 'enter' animation needed for remaining items,
        // but existing logic was length > lastCount. Let's stick to that.)
        const added =
          (currEntries as any[]).length > (prevEntries as any[]).length;
        const shouldAnimate = !dateChanged && added;

        return { entries: currEntries as any[], shouldAnimate };
      }),
    ),
    { initialValue: { entries: [], shouldAnimate: false } },
  );

  constructor() {
    // Register the animation target when the view is initialized
    effect(() => {
      const container = this.recentActivityContainer();
      if (container) {
        this.flyingTagService.setTarget(container.nativeElement);
      }
    });
  }

  /** Latest 3 entries for preview */
  readonly latestEntries = computed(() => {
    return this.viewModel().entries.slice(-3).reverse();
  });

  /** Total norm hours for current date */
  readonly totalNormHours = computed(() => {
    return this.displayEntries().reduce(
      (sum, e) => sum + (e.normHours || 0),
      0,
    );
  });

  /** Total price based on NH rate */
  readonly totalPrice = computed(() => {
    const hours = this.totalNormHours();
    const rate = this.preferences.nhRate();
    return hours * rate;
  });

  /** Has any entries */
  readonly hasEntries = computed(() => this.displayEntries().length > 0);

  /** Format part type for small tag */
  formatType(type: string | undefined): string {
    if (!type) return '';
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

  /** Handle list item entry animation */
  onListEnter(event: AnimationCallbackEvent): void {
    const el = event.target as HTMLElement;
    // shouldAnimate is true when we want animations.
    if (!this.viewModel().shouldAnimate || !el) {
      event.animationComplete();
      return;
    }

    // Capture target dimensions
    const targetWidth = el.offsetWidth;

    el.animate(
      [
        { width: '0px', opacity: 0, transform: 'scale(0.8)' },
        {
          width: `${targetWidth}px`,
          opacity: 1,
          transform: 'scale(1)',
        },
      ],
      {
        duration: 300,
        easing: 'cubic-bezier(0.2, 1, 0.2, 1)', // Fast out, slow in
        fill: 'forwards',
      },
    ).onfinish = () => {
      // Clear animation styles to let CSS take over (responsive resizing etc)
      el.style.width = '';
      el.style.opacity = '';
      el.style.transform = '';
      event.animationComplete();
    };
  }

  /** Handle list item leave animation */
  onListLeave(event: AnimationCallbackEvent): void {
    const el = event.target as HTMLElement;
    // We want leave animations if we are NOT changing dates.
    // The current viewModel logic only sets shouldAnimate=true on ADD.
    // So removals won't animate. This might be fine for "drop off" due to overflow?
    // When adding (length++), the oldest item leaves (length of displayed slice changes?).
    // Wait. `latestEntries` is a computed slice (-3).
    // If I add 1 item to a list of 3.
    // New list has 4. Slice (-3) takes last 3.
    // Compare Old Slice vs New Slice.
    // [A, B, C] -> [B, C, D].
    // A leaves. D enters.
    // Does 'leave' animation trigger for A? Yes.
    // Does `shouldAnimate` need to be true? Yes.
    // My logic: `added = curr > prev`. 4 > 3. `shouldAnimate` = true.
    // So YES, it works for the "overflow drop off" case!
    if (!this.viewModel().shouldAnimate || !el) {
      event.animationComplete();
      // If disabled, Angular removes it immediately after this call
      return;
    }

    el.animate(
      [
        { transform: 'translateY(0) scale(1)', opacity: 1 },
        { transform: 'translateY(100%) scale(0.5)', opacity: 0 },
      ],
      {
        duration: 200,
        easing: 'ease-in',
        fill: 'forwards',
      },
    ).onfinish = () => event.animationComplete();
  }
}
