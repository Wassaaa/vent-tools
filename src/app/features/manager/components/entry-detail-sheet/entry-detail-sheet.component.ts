import {
  Component,
  inject,
  input,
  output,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { WorkEntry, PartData } from '../../../../core/models/database.types';
import { VentPart } from '../../../../core/models';

// Extended type for Entry with joined Profile data
export type WorkEntryWithProfile = WorkEntry & { 
  profile?: { full_name: string; role?: string } 
};

// Extended PartData with display fields
export type DisplayPart = PartData & {
  type: string;
  normHours: number;
  subType?: string;
};

@Component({
  selector: 'app-entry-detail-sheet',
  imports: [DecimalPipe, DatePipe, MatButtonModule, MatIconModule, TranslocoModule],
  templateUrl: './entry-detail-sheet.component.html',
  styleUrl: './entry-detail-sheet.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntryDetailSheetComponent {
  private readonly transloco = inject(TranslocoService);

  /** The entry to display */
  entry = input<WorkEntryWithProfile | null>(null);

  /** Is sheet open */
  isOpen = input<boolean>(false);

  /** Emitted when close is requested */
  readonly closeSheet = output<void>();

  /** Emitted when approve is requested */
  readonly approve = output<WorkEntry>();

  /** Emitted when dispute is requested */
  readonly dispute = output<WorkEntry>();

  /** Parsed parts list */
  readonly parts = computed<DisplayPart[]>(() => {
    const entry = this.entry();
    if (!entry || !entry.parts_data) return [];
    
    // Map PartData to a display-friendly structure similar to VentPart
    return entry.parts_data.map((p: PartData) => ({
      ...p,
      type: p.partType, // Map partType to type for formatter compatibility
      normHours: (p['normHours'] as number) || 0, // Explicitly access dynamic property
      // Ensure other fields are present if needed
    } as DisplayPart));
  });

  /** Total norm hours */
  readonly totalNormHours = computed(() => {
    return this.parts().reduce((sum, p) => sum + p.normHours, 0);
  });

  /** Close the sheet */
  close(): void {
    this.closeSheet.emit();
  }

  onApprove(): void {
    const entry = this.entry();
    if (entry) this.approve.emit(entry);
  }

  onDispute(): void {
    const entry = this.entry();
    if (entry) this.dispute.emit(entry);
  }

  /** Format part description */
  formatPartDesc(part: any): string {
    const parts: string[] = [];
    
    // Translate type name
    if (part.type) {
      const translated = this.transloco.translate(part.type);
      parts.push(translated !== part.type ? translated : this.extractName(part.type));
    } else if (part.partType) {
       const translated = this.transloco.translate(part.partType);
       parts.push(translated !== part.partType ? translated : this.extractName(part.partType));
    }
    
    // Translate sub-type if present
    if (part.subType) {
      const translated = this.transloco.translate(part.subType);
      parts.push(translated !== part.subType ? translated : this.extractName(part.subType));
    }
    
    return parts.join(' - ');
  }

  private extractName(key: string): string {
    const segment = key.split('.').pop() || key;
    return segment
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (s) => s.toUpperCase())
      .trim();
  }
}
