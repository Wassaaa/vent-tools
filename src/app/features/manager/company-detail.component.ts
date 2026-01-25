import { DatePipe } from '@angular/common';
import {
  Component,
  computed,
  inject,
  input,
  resource,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';

import type { WorkEntry } from '../../core/models/database.types';
import { CompanyService } from '../../core/services/company.service';
import { SupabaseService } from '../../core/services/supabase.service';
import { WorkEntryService } from '../../core/services/work-entry.service';
import { CodeBadgeComponent } from '../../shared/components/code-badge/code-badge.component';
import { DailyWorkSheetComponent } from '../../shared/components/daily-work-sheet/daily-work-sheet.component';
import { DisputeDialogComponent } from '../../shared/components/dispute-dialog/dispute-dialog.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-company-detail',
  templateUrl: './company-detail.component.html',
  styleUrl: './company-detail.component.scss',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTabsModule,
    MatTableModule,
    MatChipsModule,
    MatTooltipModule,
    TranslocoModule,
    DatePipe,
    CodeBadgeComponent,
    EmptyStateComponent,
    PageHeaderComponent,
    DailyWorkSheetComponent,
  ],
})
export class CompanyDetailComponent {
  // Input from route param binding
  id = input.required<string>();

  private companyService = inject(CompanyService);
  private workEntryService = inject(WorkEntryService);
  private supabaseService = inject(SupabaseService);
  private snackBar = inject(MatSnackBar);
  private transloco = inject(TranslocoService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  isManager = this.supabaseService.isManager; // Inject signal for role check

  // --- Resources ---

  // 1. Company Resource
  companyResource = resource({
    params: () => this.id(),
    loader: async ({ params: id }) => {
      const result = await this.companyService.getUserCompanies();
      if (result.success && result.companies) {
        const found = result.companies.find((c) => c.id === id);
        if (found) return found;
      }
      this.router.navigate(['/manager/dashboard']);
      return null;
    },
  });

  // 2. Workers Resource (Manager Only)
  workersResource = resource({
    params: () => ({ id: this.id(), isManager: this.isManager() }),
    loader: async ({ params: request }) => {
      if (!request.isManager) return [];
      const result = await this.companyService.getCompanyWorkers(request.id);
      return result.workers || [];
    },
  });

  // 3. Entries Resource
  entriesResource = resource({
    params: () => this.id(),
    loader: async ({ params: id }) => {
      const result = await this.workEntryService.getCompanyWorkEntries(id);
      return result.entries || [];
    },
  });

  // --- Computed Signals for Template ---

  isLoading = computed(() => this.companyResource.isLoading());
  company = computed(() => this.companyResource.value());
  workers = computed(() => this.workersResource.value() || []);
  entries = computed(() => this.entriesResource.value() || []);

  // Selected entry for detail view
  selectedEntry = signal<WorkEntry | null>(null);
  isDetailOpen = computed(() => !!this.selectedEntry());

  // Table columns - computed based on role
  workerColumns = ['name', 'role', 'joined'];
  entryColumns = computed(() =>
    this.isManager()
      ? ['date', 'worker', 'status', 'actions']
      : ['date', 'status', 'actions'],
  );

  viewEntry(entry: WorkEntry): void {
    this.selectedEntry.set(entry);
  }

  closeEntryDetail(): void {
    this.selectedEntry.set(null);
  }

  async approveEntry(entryId: string): Promise<void> {
    const result = await this.workEntryService.updateEntryStatus(
      entryId,
      'approved',
    );
    if (result.success) {
      this.snackBar.open(
        this.transloco.translate('manager.entries.approved'),
        this.transloco.translate('common.close'),
        { duration: 3000 },
      );
      this.closeEntryDetail();
      this.entriesResource.reload(); // Silent reload
    } else {
      this.snackBar.open(
        result.error || 'Error',
        this.transloco.translate('common.close'),
        { duration: 5000 },
      );
    }
  }

  async rejectEntry(
    entryOrEvent: WorkEntry | { id: string; reason: string },
  ): Promise<void> {
    let id: string;
    let reason: string | null = null;

    if ('reason' in entryOrEvent) {
      // Event from DailyWorkSheet
      id = entryOrEvent.id;
      reason = entryOrEvent.reason;
    } else {
      // Entry from Table - Open Dialog
      id = entryOrEvent.id;
      const dialogRef = this.dialog.open(DisputeDialogComponent, {
        width: '400px',
      });
      const result = await firstValueFrom(dialogRef.afterClosed());
      if (!result) return;
      reason = result;
    }

    if (!reason) return;

    const result = await this.workEntryService.disputeEntry(id, reason);
    if (result.success) {
      this.snackBar.open(
        this.transloco.translate('manager.entries.disputed'),
        this.transloco.translate('common.close'),
        { duration: 3000 },
      );
      this.closeEntryDetail();
      this.entriesResource.reload(); // Silent reload
    }
  }
}
