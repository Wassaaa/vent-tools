import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';

/**
 * Reusable size stepper component for selecting from a list of discrete sizes.
 * 
 * Features:
 * - Large touch-friendly +/- buttons
 * - Material discrete slider with tick marks
 * - Prominent size display
 * - Snaps to valid sizes only
 * 
 * @example
 * ```html
 * <app-size-stepper
 *   [sizes]="[100, 125, 160, 200, 250]"
 *   [value]="selectedSize()"
 *   unit="mm"
 *   (valueChange)="onSizeChange($event)"
 * />
 * ```
 */
@Component({
  selector: 'app-size-stepper',
  imports: [MatButtonModule, MatIconModule, MatSliderModule],
  templateUrl: './size-stepper.component.html',
  styleUrl: './size-stepper.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SizeStepperComponent {
  /** Available sizes to choose from (required) */
  readonly sizes = input.required<number[]>();

  /** Current selected size (required) */
  readonly value = input.required<number>();

  /** Unit to display (e.g., "mm", "m³/s") */
  readonly unit = input<string>('mm');

  /** Label for accessibility */
  readonly label = input<string>('Size');

  /** Emitted when size changes */
  readonly valueChange = output<number>();

  /** Current index in the sizes array */
  readonly currentIndex = computed(() => {
    const sizes = this.sizes();
    const value = this.value();
    const index = sizes.indexOf(value);
    return index >= 0 ? index : this.findClosestIndex(value, sizes);
  });

  /** Maximum index (for slider max) */
  readonly maxIndex = computed(() => Math.max(0, this.sizes().length - 1));

  /** Can go to previous size */
  readonly canDecrement = computed(() => this.currentIndex() > 0);

  /** Can go to next size */
  readonly canIncrement = computed(() => this.currentIndex() < this.maxIndex());

  /** Formatted size for display */
  readonly displayValue = computed(() => {
    const value = this.value();
    const unit = this.unit();
    return `${value} ${unit}`;
  });

  /** Go to previous size */
  decrement(): void {
    const index = this.currentIndex();
    if (index > 0) {
      this.emitSizeAtIndex(index - 1);
    }
  }

  /** Go to next size */
  increment(): void {
    const index = this.currentIndex();
    if (index < this.maxIndex()) {
      this.emitSizeAtIndex(index + 1);
    }
  }

  /** Handle slider input (live updates during drag) */
  onSliderInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const index = parseInt(input.value, 10);
    if (!isNaN(index)) {
      this.emitSizeAtIndex(index);
    }
  }

  /** Emit size at given index */
  private emitSizeAtIndex(index: number): void {
    const sizes = this.sizes();
    if (index >= 0 && index < sizes.length) {
      const newSize = sizes[index];
      if (newSize !== this.value()) {
        this.valueChange.emit(newSize);
      }
    }
  }

  /** Find closest index for a value not in the array */
  private findClosestIndex(value: number, sizes: number[]): number {
    if (sizes.length === 0) return 0;

    let closestIndex = 0;
    let closestDiff = Math.abs(sizes[0] - value);

    for (let i = 1; i < sizes.length; i++) {
      const diff = Math.abs(sizes[i] - value);
      if (diff < closestDiff) {
        closestDiff = diff;
        closestIndex = i;
      }
    }

    return closestIndex;
  }

  /**
   * Static utility to find the closest available size.
   * Useful when changing part types to maintain size continuity.
   */
  static findClosestSize(targetSize: number, availableSizes: number[]): number {
    if (availableSizes.length === 0) return targetSize;
    if (availableSizes.includes(targetSize)) return targetSize;

    return availableSizes.reduce((prev, curr) =>
      Math.abs(curr - targetSize) < Math.abs(prev - targetSize) ? curr : prev
    );
  }
}
