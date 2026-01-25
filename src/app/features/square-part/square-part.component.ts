import { DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { TranslocoModule } from '@jsverse/transloco';

import { SquarePartType } from '@core/models';
import {
  CalculationService,
  FlyingTagService,
  PreferencesService,
  TesDataService,
  WorkLogService,
} from '@core/services';
import { AmountInputComponent } from '@shared/components/amount-input/amount-input.component';
import { SizeStepperComponent } from '@shared/components/size-stepper/size-stepper.component';

/** Standard square duct sizes in mm */
const STANDARD_SIZES = [
  50, 100, 125, 150, 160, 200, 250, 300, 315, 350, 400, 450, 500, 560, 600, 630,
  700, 710, 800, 900, 1000, 1120, 1250, 1400, 1600, 1800, 2000,
];

/**
 * Calculator component for square/rectangular ventilation parts.
 * Uses dual size-steppers for width and height selection.
 */
@Component({
  selector: 'app-square-part',
  imports: [
    DecimalPipe,
    MatCardModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule,
    TranslocoModule,
    AmountInputComponent,
    SizeStepperComponent,
  ],
  templateUrl: './square-part.component.html',
  styleUrl: './square-part.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SquarePartComponent {
  private tesData = inject(TesDataService);
  private calcService = inject(CalculationService);
  private workLog = inject(WorkLogService);
  private preferences = inject(PreferencesService);
  private flyingTagService = inject(FlyingTagService);

  /** Standard sizes available for selection */
  readonly standardSizes = STANDARD_SIZES;

  /** Available square part types */
  readonly partTypes = computed(() => this.tesData.squareParts);

  /** Currently selected part type */
  readonly selectedType = signal<SquarePartType | null>(null);

  /** Width in mm */
  readonly width = signal(this.preferences.calculatorState().square.width);

  /** Height in mm */
  readonly height = signal(this.preferences.calculatorState().square.height);

  constructor() {
    // Initialize state from preferences or defaults
    effect(() => {
      const types = this.partTypes();
      if (types.length > 0 && !this.selectedType()) {
        const savedIndex = this.preferences.calculatorState().square.typeIndex;
        // Ensure index is within bounds, otherwise default to 0
        const index =
          savedIndex >= 0 && savedIndex < types.length ? savedIndex : 0;
        this.selectedType.set(types[index]);
      }
    });
  }

  /** Formatted size display */
  readonly sizeDisplay = computed(() => {
    return `${this.width()} x ${this.height()} mm`;
  });

  /** Calculated area in m² */
  readonly area = computed(() => {
    return (this.width() / 1000) * (this.height() / 1000);
  });

  /** Calculated perimeter for 1m length in m */
  readonly perimeter = computed(() => {
    return ((this.width() + this.height()) * 2) / 1000;
  });

  /** Unit for the selected type (m for ducts, tk for grilles) */
  readonly unit = computed(() => {
    const type = this.selectedType();
    return type?.areaBrackets ? 'tk' : 'm';
  });

  /** Whether the form is valid for submission */
  readonly canSubmit = computed(() => {
    return this.selectedType() !== null;
  });

  /** Loading state from TES data */
  readonly isLoading = computed(() => this.tesData.configResource.isLoading());

  /** Handle part type selection */
  onTypeChange(type: SquarePartType): void {
    this.selectedType.set(type);

    // Persist type selection
    const index = this.partTypes().indexOf(type);
    if (index !== -1) {
      this.preferences.updateCalculatorState('square', { typeIndex: index });
    }
  }

  /** Handle width change */
  onWidthChange(value: number): void {
    this.width.set(value);
    this.preferences.updateCalculatorState('square', { width: value });
  }

  /** Handle height change */
  onHeightChange(value: number): void {
    this.height.set(value);
    this.preferences.updateCalculatorState('square', { height: value });
  }

  /** Handle form submission */
  onSubmit(amount: number, sourceElement?: HTMLElement): void {
    const type = this.selectedType();
    if (!type) return;

    // Trigger flying animation
    if (sourceElement) {
      this.flyingTagService.fly(sourceElement, this.sizeDisplay());
    }

    // Calculate and add to work log
    const entry = this.calcService.calculateSquarePart(
      this.width(),
      this.height(),
      amount,
      type,
    );
    this.workLog.addEntry(entry);
  }
}
