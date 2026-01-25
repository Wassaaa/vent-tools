import { DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

import { VentPart } from '@core/models';
import { PartData, WorkEntry } from '@core/models/database.types';
import { PreferencesService } from '@core/services';
import { DurationPipe } from '@shared/pipes/duration.pipe';
import { DisputeDialogComponent } from '../dispute-dialog/dispute-dialog.component';

// Unified type for display
export interface DisplayPart {
  name: string;
  size: string;
  amount: number;
  normHours: number;
  original: VentPart | PartData;
}

@Component({
  selector: 'app-daily-work-sheet',
  imports: [
    MatButtonModule,
    MatIconModule,
    TranslocoModule,
    DurationPipe,
    DecimalPipe,
  ],
  templateUrl: './daily-work-sheet.component.html',
  styleUrl: './daily-work-sheet.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DailyWorkSheetComponent {
  private transloco = inject(TranslocoService);
  private dialog = inject(MatDialog);
  private preferences = inject(PreferencesService);

  // --- Inputs ---

  /** Sheet visibility */
  isOpen = input<boolean>(false);

  /** Mode: 'worker' (calculator view) or 'manager' (dashboard view) */
  mode = input.required<'worker' | 'manager'>();

  /**
   * Local Data Input
   */
  localEntries = input<VentPart[]>([]);

  /**
   * Cloud Data Input
   */
  cloudEntry = input<WorkEntry | null>(null);

  /** Display Name */
  contextName = input<string>('Personal Work');

  /** Helper for manual sync availability */
  isAuthenticated = input<boolean>(false);

  /** Active Company Name for Move logic */
  activeCompanyName = input<string | null>(null);

  // --- Outputs ---

  close = output<void>();
  deleteEntry = output<string>();
  clearAll = output<void>();

  approve = output<string>();
  reject = output<{ id: string; reason: string }>();
  revise = output<void>();

  // New Output for Manual Sync
  moveToCloud = output<void>();

  updateAmount = output<{ id: string; amount: number }>();

  // --- Computed State ---

  /** Unified list of parts for display */
  displayParts = computed<DisplayPart[]>(() => {
    // 1. Prioritize Cloud Entry
    const cloud = this.cloudEntry();
    if (cloud && cloud.parts_data) {
      return (cloud.parts_data as any[]).map((p) => ({
        name: this.formatPartName(p.partType, p.subType),
        size: p.size ? `Ø${p.size}` : '',
        amount: p.amount,
        normHours: p.normHours || 0,
        original: p,
      }));
    }

    // 2. Fallback to Local Entries
    // Only show local entries if NO cloud entry exists OR if we explicitly want to show them?
    // Current logic: If Cloud exists, show Cloud.
    // If not authenticated, show Local.
    // If authenticated but Cloud is empty? Show Cloud (empty).
    // The issue: If I have local data, I want to see it to "Move" it.
    // But if I show it, I might confuse the user "I thought I was logged in".
    // User Requirement: "Not Logged In: App reads/writes solely to localStorage. Logged In: App reads/writes solely to Supabase. Local storage is ignored."
    // BUT User wants "Move to Company".
    // Compromise: The Sheet shows what is "Active".
    // If Logged In, Active is Cloud.
    // If Not Logged In, Active is Local.
    // "Move to Company" should probably be a button that acts on the *hidden* local data?
    // OR, we show Local Data in a separate section?
    // User reference: "Header actions -> move-btn".
    // If I click Move, it moves local to cloud.
    // Visuals: The list shows the *target*?
    // Let's stick to "Strict Separation" for the LIST.
    // The "Move" button will invoke a process that takes the *Local* entries (which are passed as input) and pushes them.
    // The user doesn't necessarily need to *see* the individual local parts in the list to click "Move".
    // (Though it would be nice).
    // I will stick to: List shows Cloud if logged in (even if empty).
    // Move Button appears if `localEntries.length > 0` AND authenticated.

    // So displayParts remains:
    if (this.mode() === 'manager' || this.isAuthenticated()) {
      // Cloud view (Manager or Auth Worker)
      // If cloud entry is null, it's just empty.
      if (!cloud) return [];
      return ((cloud.parts_data as any[]) || []).map((p) => ({
        name: this.formatPartName(p.partType, p.subType),
        size: p.size ? `Ø${p.size}` : '',
        amount: p.amount,
        normHours: p.normHours || 0,
        original: p,
      }));
    }

    // Local view (Unauth Worker)
    const local = this.localEntries();
    if (local.length > 0) {
      return local.map((p) => ({
        name: this.formatPartName(p.type, p.subType),
        size: p.sizeDisplay || '',
        amount: p.amount,
        normHours: p.normHours,
        original: p,
      }));
    }

    return [];
  });

  canMoveToActive = computed(() => {
    if (!this.isAuthenticated()) return false;
    const activeId = this.preferences.activeCompanyId();
    if (!activeId) return false;

    const cloud = this.cloudEntry();
    // Only move if we HAVE a cloud entry AND its company is different from active selection
    return cloud !== null && cloud.company_id !== activeId;
  });

  /** Determining label and icon for the button */
  moveButtonInfo = computed(() => {
    return {
      labelKey: 'workLog.moveTitle',
      icon: 'swap_horiz',
    };
  });

  // ... actions ...
  onMoveToActive() {
    this.moveToCloud.emit();
  }

  totalNormHours = computed(() =>
    this.displayParts().reduce((sum, p) => sum + p.normHours, 0),
  );

  totalPrice = computed(() => {
    return this.totalNormHours() * this.preferences.nhRate();
  });

  entryStatus = computed(() => this.cloudEntry()?.status || 'draft');

  rejectionReason = computed(() => {
    const entry = this.cloudEntry();
    if (entry && entry.entry_reviews && entry.entry_reviews.length > 0) {
      return entry.entry_reviews[0].review_note; // Latest note due to ordering
    }
    return null;
  });

  isEditing = signal(false);

  toggleEditMode() {
    this.isEditing.update((v) => !v);
  }

  // Edit Actions
  onIncrease(part: DisplayPart) {
    const original = part.original as VentPart; // or PartData, both have id or we need to fallback?
    // We need ID to update.
    if (original.id) {
      this.updateAmount.emit({ id: original.id, amount: part.amount + 1 });
    }
  }

  onDecrease(part: DisplayPart) {
    const original = part.original;
    if (part.amount > 0 && original.id) {
      this.updateAmount.emit({ id: original.id, amount: part.amount - 1 });
    }
  }

  onAmountChange(part: DisplayPart, event: Event) {
    const min = 0;
    const val = parseInt((event.target as HTMLInputElement).value, 10);
    if (!isNaN(val) && val >= min && part.original.id) {
      this.updateAmount.emit({ id: part.original.id, amount: val });
    }
  }

  // --- Actions ---

  onClose() {
    this.close.emit();
  }

  onDelete(part: DisplayPart) {
    // Only supported for local entries currently
    const original = part.original as VentPart;
    if (original.id) {
      this.deleteEntry.emit(original.id);
    }
  }

  onApprove() {
    const entry = this.cloudEntry();
    if (entry) this.approve.emit(entry.id);
  }

  onReject() {
    const entry = this.cloudEntry();
    if (!entry) return;

    const dialogRef = this.dialog.open(DisputeDialogComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((reason) => {
      if (reason) {
        this.reject.emit({ id: entry.id, reason });
      }
    });
  }

  // --- Helpers ---

  private formatPartName(type: string, subType?: string): string {
    const parts: string[] = [];

    if (type) {
      const translated = this.transloco.translate(type);
      parts.push(translated !== type ? translated : this.extractName(type));
    }

    if (subType) {
      const translated = this.transloco.translate(subType);
      parts.push(
        translated !== subType ? translated : this.extractName(subType),
      );
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
