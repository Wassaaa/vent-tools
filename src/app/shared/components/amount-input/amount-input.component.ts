import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TranslocoModule } from '@jsverse/transloco';

/**
 * Reusable amount input component with +/- buttons and submit.
 * Designed for touch-friendly "fat finger" interaction.
 */
@Component({
  selector: 'app-amount-input',
  imports: [
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    TranslocoModule,
  ],
  templateUrl: './amount-input.component.html',
  styleUrl: './amount-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AmountInputComponent {
  /** Unit label to display (e.g., "tk", "m") */
  unit = input<string>('tk');

  /** Minimum allowed value */
  min = input<number>(1);

  /** Maximum allowed value */
  max = input<number>(9999);

  /** Step value for increment/decrement */
  step = input<number>(1);

  /** Whether the submit button is disabled */
  submitDisabled = input<boolean>(false);

  /** Emitted when user clicks submit */
  submitted = output<{ amount: number; source?: HTMLElement }>();

  /** Current amount value */
  readonly amount = signal(1);

  /** Computed flag for whether decrement is disabled */
  readonly canDecrement = computed(() => this.amount() > this.min());

  /** Computed flag for whether increment is disabled */
  readonly canIncrement = computed(() => this.amount() < this.max());

  /** Increment the amount */
  increment(): void {
    if (this.canIncrement()) {
      this.amount.update((v) => Math.min(v + this.step(), this.max()));
    }
  }

  /** Decrement the amount */
  decrement(): void {
    if (this.canDecrement()) {
      this.amount.update((v) => Math.max(v - this.step(), this.min()));
    }
  }

  /** Set amount directly from input */
  setAmount(value: number): void {
    const clamped = Math.max(this.min(), Math.min(this.max(), value));
    this.amount.set(clamped);
  }

  /** Handle submit button click */
  onSubmit(event: Event): void {
    let source = event.target as HTMLElement;
    // Try to find the button if the target was an icon inside
    const button = source.closest('button');
    if (button) {
      source = button;
    }

    this.submitted.emit({ amount: this.amount(), source });
    // Reset to 1 after submit
    this.amount.set(1);
  }

  /** Reset to default value */
  reset(): void {
    this.amount.set(1);
  }
}
