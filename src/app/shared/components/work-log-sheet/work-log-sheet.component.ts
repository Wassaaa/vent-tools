import {
  Component,
  inject,
  input,
  output,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { WorkLogService, PreferencesService, SessionService } from '@core/services';
import { VentPart } from '@core/models';
import { DurationPipe } from '@shared/pipes/duration.pipe';

/**
 * Work log bottom sheet displaying entries for the selected day.
 * Allows deleting/merging entries and shows totals.
 */
@Component({
  selector: 'app-work-log-sheet',
  imports: [DecimalPipe, MatButtonModule, MatIconModule, TranslocoModule, DurationPipe],
  templateUrl: './work-log-sheet.component.html',
  styleUrl: './work-log-sheet.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkLogSheetComponent {
  private readonly workLog = inject(WorkLogService);
  private readonly preferences = inject(PreferencesService);
  private readonly session = inject(SessionService);
  private readonly transloco = inject(TranslocoService);

  /** Is sheet open */
  isOpen = input<boolean>(false);

  /** Emitted when close is requested */
  readonly closeSheet = output<void>();

  /** Entries filtered by current date */
  readonly entries = computed(() => {
    const date = this.session.workDate();
    return this.workLog.getEntriesByDate(date);
  });

  /** Total norm hours for current date */
  readonly totalNormHours = computed(() => {
    return this.entries().reduce((sum, e) => sum + e.normHours, 0);
  });

  /** Total price */
  readonly totalPrice = computed(() => {
    return this.totalNormHours() * this.preferences.nhRate();
  });

  /** Has entries */
  readonly hasEntries = computed(() => this.entries().length > 0);

  /** Delete an entry */
  deleteEntry(entry: VentPart): void {
    this.workLog.removeEntry(entry.id);
  }

  /** Clear all entries for current date */
  clearAll(): void {
    const entries = this.entries();
    for (const entry of entries) {
      this.workLog.removeEntry(entry.id);
    }
  }

  /** Merge duplicate entries */
  mergeDuplicates(): void {
    this.workLog.mergeDuplicates();
  }

  /** Close the sheet */
  close(): void {
    this.closeSheet.emit();
  }

  /** Track function for @for */
  trackById(_index: number, entry: VentPart): string {
    return entry.id;
  }

  /** Format part description with translated type name */
  formatPartDesc(entry: VentPart): string {
    const parts: string[] = [];
    
    // Translate type name (e.g., "machines.modularUnit" -> "Modular Unit")
    if (entry.type) {
      const translated = this.transloco.translate(entry.type);
      // If translation key not found, use the raw type (after last dot)
      parts.push(translated !== entry.type ? translated : this.extractName(entry.type));
    }
    
    // Translate sub-type if present
    if (entry.subType) {
      const translated = this.transloco.translate(entry.subType);
      parts.push(translated !== entry.subType ? translated : this.extractName(entry.subType));
    }
    
    return parts.join(' - ');
  }

  /** Extract readable name from translation key */
  private extractName(key: string): string {
    // Get last segment after dot, convert camelCase to Title Case
    const segment = key.split('.').pop() || key;
    return segment
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (s) => s.toUpperCase())
      .trim();
  }
}
