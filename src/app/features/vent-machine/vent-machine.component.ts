import {
  Component,
  inject,
  signal,
  computed,
  effect,
  ChangeDetectionStrategy,
} from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TranslocoModule } from '@jsverse/transloco';

import { TesDataService, CalculationService, WorkLogService, PreferencesService } from '@core/services';
import { Machine } from '@core/models';
import { AmountInputComponent } from '@shared/components/amount-input/amount-input.component';
import { SizeStepperComponent } from '@shared/components/size-stepper/size-stepper.component';

/**
 * Calculator component for ventilation machines and equipment.
 * 
 * Supports multiple display types:
 * - Type 1: Single type with sizes (e.g., supply units)
 * - Type 2: Multiple sub-types with sizes (e.g., modular units)
 * - Type 3: Multiple sub-types, no sizes (e.g., small machines - per piece)
 * - Type 4: Sizes in kg
 * - Type 5: Sizes in mm
 */
@Component({
  selector: 'app-vent-machine',
  imports: [
    MatSelectModule,
    MatFormFieldModule,
    TranslocoModule,
    AmountInputComponent,
    SizeStepperComponent,
  ],
  templateUrl: './vent-machine.component.html',
  styleUrl: './vent-machine.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VentMachineComponent {
  private readonly tesData = inject(TesDataService);
  private readonly calcService = inject(CalculationService);
  private readonly workLog = inject(WorkLogService);
  private readonly preferences = inject(PreferencesService);

  /** Available machine types */
  readonly machineTypes = computed(() => this.tesData.machineParts);

  /** Currently selected machine type */
  readonly selectedMachine = signal<Machine | null>(null);

  /** Currently selected sub-type index */
  readonly selectedSubTypeIndex = signal<number>(0);

  /** Currently selected size (persisted across type changes) */
  readonly selectedSize = signal<number>(this.preferences.calculatorState().machine.size);

  constructor() {
    // Initialize state from preferences or defaults
    effect(() => {
      const types = this.machineTypes();
      if (types.length > 0 && !this.selectedMachine()) {
        const savedIndex = this.preferences.calculatorState().machine.typeIndex;
        // Only load if savedIndex is valid (>= 0). If -1, stays null (no default selection).
        // This differs from Round/Square which default to 0.
        if (savedIndex >= 0 && savedIndex < types.length) {
          const machine = types[savedIndex];
          this.selectedMachine.set(machine);
          
          // Restore sub-type index if applicable
          const savedSubTypeIndex = this.preferences.calculatorState().machine.subTypeIndex;
          if (savedSubTypeIndex >= 0 && savedSubTypeIndex < (machine.types?.length || 0)) {
            this.selectedSubTypeIndex.set(savedSubTypeIndex);
          }
        }
      }
    });
  }

  /** Available sub-types for selected machine */
  readonly availableSubTypes = computed(() => {
    const machine = this.selectedMachine();
    if (!machine || machine.types.length <= 1) return [];
    return machine.types;
  });

  /** Whether to show sub-type selector (displayType 2 or 3) */
  readonly showSubTypeSelector = computed(() => {
    const machine = this.selectedMachine();
    if (!machine) return false;
    return machine.displayType === 'with-subtype' || machine.displayType === 'subtype-only';
  });

  /** Whether to show size selector (not displayType 3) */
  readonly showSizeSelector = computed(() => {
    const machine = this.selectedMachine();
    if (!machine) return false;
    return machine.displayType !== 'subtype-only';
  });

  /** Available sizes for the selected machine/sub-type */
  readonly availableSizes = computed(() => {
    const machine = this.selectedMachine();
    if (!machine) return [];

    const typeIndex = this.showSubTypeSelector() ? this.selectedSubTypeIndex() : 0;
    return this.tesData.getSizesForMachine(machine, typeIndex);
  });

  /** Effective size (snapped to available sizes) */
  readonly effectiveSize = computed(() => {
    const sizes = this.availableSizes();
    const current = this.selectedSize();
    if (sizes.length === 0) return current;
    return SizeStepperComponent.findClosestSize(current, sizes);
  });

  /** Size unit display */
  readonly sizeUnit = computed(() => {
    const machine = this.selectedMachine();
    if (!machine) return 'mm';
    return machine.sizeUnit || 'mm';
  });

  /** Unit for amount input */
  readonly unit = computed(() => {
    const machine = this.selectedMachine();
    if (!machine) return 'tk';
    const typeIndex = this.selectedSubTypeIndex();
    return machine.types[typeIndex]?.unit ?? 'tk';
  });

  /** Whether the form is valid for submission */
  readonly canSubmit = computed(() => {
    const machine = this.selectedMachine();
    if (!machine) return false;

    // For displayType 3 (small machines), no size needed
    if (machine.displayType === 'subtype-only') return true;

    return this.availableSizes().length > 0;
  });

  /** Loading state from TES data */
  readonly isLoading = computed(() => this.tesData.configResource.isLoading());

  /** Handle machine type selection */
  onMachineChange(machine: Machine): void {
    this.selectedMachine.set(machine);
    this.selectedSubTypeIndex.set(0);

    // Persist machine selection
    const index = this.machineTypes().indexOf(machine);
    if (index !== -1) {
      this.preferences.updateCalculatorState('machine', { typeIndex: index, subTypeIndex: 0 });
    }

    // Find closest available size
    if (machine.displayType !== 'subtype-only') {
      const sizes = this.tesData.getSizesForMachine(machine, 0);
      if (sizes.length > 0) {
        const closest = SizeStepperComponent.findClosestSize(this.selectedSize(), sizes);
        this.selectedSize.set(closest);
        this.preferences.updateCalculatorState('machine', { size: closest });
      }
    }
  }

  /** Handle sub-type selection */
  onSubTypeChange(index: number): void {
    this.selectedSubTypeIndex.set(index);
    this.preferences.updateCalculatorState('machine', { subTypeIndex: index });

    // Update size for new sub-type
    const machine = this.selectedMachine();
    if (machine && machine.displayType !== 'subtype-only') {
      const sizes = this.tesData.getSizesForMachine(machine, index);
      if (sizes.length > 0) {
        const closest = SizeStepperComponent.findClosestSize(this.selectedSize(), sizes);
        this.selectedSize.set(closest);
        this.preferences.updateCalculatorState('machine', { size: closest });
      }
    }
  }

  /** Handle size change */
  onSizeChange(size: number): void {
    this.selectedSize.set(size);
    this.preferences.updateCalculatorState('machine', { size });
  }

  /** Handle form submission */
  onSubmit(amount: number): void {
    const machine = this.selectedMachine();
    if (!machine) return;

    const size = machine.displayType === 'subtype-only' ? 1 : this.effectiveSize();
    const typeIndex = this.showSubTypeSelector() ? this.selectedSubTypeIndex() : 0;

    const entry = this.calcService.calculateMachinePart(machine, size, amount, typeIndex);
    this.workLog.addEntry(entry);
  }
}
