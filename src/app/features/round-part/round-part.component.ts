import {
  Component,
  inject,
  signal,
  computed,
  effect,
  ChangeDetectionStrategy,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { TranslocoModule } from '@jsverse/transloco';

import { TesDataService, CalculationService, WorkLogService, PreferencesService } from '@core/services';
import { Machine } from '@core/models';
import { AmountInputComponent } from '@shared/components/amount-input/amount-input.component';
import { SizeStepperComponent } from '@shared/components/size-stepper/size-stepper.component';

/**
 * Calculator component for round ventilation parts.
 * Uses size-stepper for intuitive size selection with persistence.
 */
@Component({
  selector: 'app-round-part',
  imports: [
    MatCardModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule,
    TranslocoModule,
    AmountInputComponent,
    SizeStepperComponent,
  ],
  templateUrl: './round-part.component.html',
  styleUrl: './round-part.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoundPartComponent {
  private tesData = inject(TesDataService);
  private calcService = inject(CalculationService);
  private workLog = inject(WorkLogService);
  private preferences = inject(PreferencesService);

  /** Available round part types */
  readonly partTypes = computed(() => this.tesData.roundParts);

  /** Currently selected part type */
  readonly selectedType = signal<Machine | null>(null);

  /** Persisted size - maintained across type changes */
  readonly selectedSize = signal<number>(this.preferences.calculatorState().round.size);

  constructor() {
    // Initialize state from preferences or defaults
    effect(() => {
      const types = this.partTypes();
      if (types.length > 0 && !this.selectedType()) {
        const savedIndex = this.preferences.calculatorState().round.typeIndex;
        // Ensure index is within bounds, otherwise default to 0
        const index = savedIndex >= 0 && savedIndex < types.length ? savedIndex : 0;
        this.selectedType.set(types[index]);
      }
    }, { allowSignalWrites: true });
  }

  /** Available sizes for the selected type */
  readonly availableSizes = computed(() => {
    const type = this.selectedType();
    if (!type) return [];
    return this.tesData.getSizesForMachine(type);
  });

  /** Effective size (snapped to nearest available) */
  readonly effectiveSize = computed(() => {
    const sizes = this.availableSizes();
    const current = this.selectedSize();
    if (sizes.length === 0) return current;
    return SizeStepperComponent.findClosestSize(current, sizes);
  });

  /** Unit for the selected type */
  readonly unit = computed(() => {
    const type = this.selectedType();
    return type?.types[0]?.unit ?? 'tk';
  });

  /** Whether the form is valid for submission */
  readonly canSubmit = computed(() => {
    return this.selectedType() !== null && this.availableSizes().length > 0;
  });

  /** Loading state from TES data */
  readonly isLoading = computed(() => this.tesData.configResource.isLoading());

  /** Handle part type selection */
  onTypeChange(type: Machine): void {
    this.selectedType.set(type);

    // Persist type selection
    const index = this.partTypes().indexOf(type);
    if (index !== -1) {
      this.preferences.updateCalculatorState('round', { typeIndex: index });
    }

    // Find closest available size to maintain continuity
    const sizes = this.tesData.getSizesForMachine(type);
    if (sizes.length > 0) {
      const closest = SizeStepperComponent.findClosestSize(this.selectedSize(), sizes);
      this.selectedSize.set(closest);
      // We don't save size here automatically, only when user explicitly changes it or on submit?
      // Actually, user expects "last selected values" to remain. So if auto-snap changes it, we should save.
      this.preferences.updateCalculatorState('round', { size: closest });
    }
  }

  /** Handle size change from stepper */
  onSizeChange(size: number): void {
    this.selectedSize.set(size);
    this.preferences.updateCalculatorState('round', { size });
  }

  /** Handle form submission */
  onSubmit(amount: number): void {
    const type = this.selectedType();
    const size = this.effectiveSize();

    if (!type || size === null) return;

    // Calculate and add to work log
    const entry = this.calcService.calculateMachinePart(type, size, amount);
    this.workLog.addEntry(entry);
  }
}
