import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule } from '@jsverse/transloco';

import { WorkLogService, CalculationService } from '@core/services';
import { VentPart } from '@core/models';
import { DurationPipe } from '@shared/pipes/duration.pipe';

/**
 * Displays the work log as a table with totals and actions.
 * Supports drag-drop reordering and row deletion.
 */
@Component({
  selector: 'app-work-table',
  imports: [
    DecimalPipe,
    DragDropModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
    TranslocoModule,
    DurationPipe,
  ],
  templateUrl: './work-table.component.html',
  styleUrl: './work-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkTableComponent {
  private workLog = inject(WorkLogService);
  private calc = inject(CalculationService);

  /** Table columns to display */
  readonly displayedColumns = ['sizeDisplay', 'type', 'amount', 'normHours', 'actions'];

  /** Work log entries (from service signal) */
  readonly entries = this.workLog.entries;

  /** Total norm hours */
  readonly totalNormHours = this.workLog.totalNormHours;

  /** Entry count */
  readonly entryCount = this.workLog.entryCount;

  /** Format norm hours for display */
  formatHours(hours: number): string {
    return this.calc.formatNormHours(hours);
  }

  /** Calculate monetary value */
  calculateValue(hours: number): number {
    return this.calc.calculateValue(hours);
  }

  /** Handle drag-drop reorder */
  onDrop(event: CdkDragDrop<VentPart[]>): void {
    if (event.previousIndex !== event.currentIndex) {
      this.workLog.reorderEntries(event.previousIndex, event.currentIndex);
    }
  }

  /** Remove a single entry */
  removeEntry(id: string): void {
    this.workLog.removeEntry(id);
  }

  /** Merge duplicate entries */
  mergeDuplicates(): void {
    this.workLog.mergeDuplicates();
  }

  /** Clear all entries */
  clearAll(): void {
    if (confirm('Are you sure you want to delete all entries?')) {
      this.workLog.clearAll();
    }
  }

  /** Get display name for type (strip translation key prefix) */
  getTypeDisplay(entry: VentPart): string {
    // The type contains translation keys like "roundParts.pipe"
    // For now, just show the last part; proper translation will come from transloco
    const parts = entry.type.split('.');
    return parts[parts.length - 1];
  }
}
