import { Component, inject, input, OnInit, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

import type { Company, WorkEntry } from '../../core/models/database.types';
import { CompanyService } from '../../core/services/company.service';
import { WorkEntryService } from '../../core/services/work-entry.service';
import { SupabaseService } from '../../core/services/supabase.service';
import { CodeBadgeComponent } from '../../shared/components/code-badge/code-badge.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { EntryDetailSheetComponent } from './components/entry-detail-sheet/entry-detail-sheet.component';

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
    EntryDetailSheetComponent,
  ],
})
export class CompanyDetailComponent implements OnInit {
  // Input from route param binding
  id = input.required<string>();

  private companyService = inject(CompanyService);
  private workEntryService = inject(WorkEntryService);
  private supabaseService = inject(SupabaseService);
  private snackBar = inject(MatSnackBar);
  private transloco = inject(TranslocoService);
  private router = inject(Router);

  isLoading = signal(true);
  company = signal<Company | null>(null);
  workers = signal<any[]>([]);
  entries = signal<any[]>([]);
  isManager = this.supabaseService.isManager; // Inject signal for role check
  
  // Selected entry for detail view
  selectedEntry = signal<WorkEntry | null>(null);
  isDetailOpen = computed(() => !!this.selectedEntry());

  // Table columns - computed based on role
  workerColumns = ['name', 'role', 'joined'];
  entryColumns = computed(() => 
    this.isManager() 
      ? ['date', 'worker', 'status', 'actions']
      : ['date', 'status', 'actions']
  );

  async ngOnInit(): Promise<void> {
    await this.loadData();
  }

  async loadData(): Promise<void> {
    this.isLoading.set(true);
    const companyId = this.id();

    // 1. Get Company Details (we need to fetch it again or pass it somehow, fetching is safer)
    const companiesResult = await this.companyService.getUserCompanies();
    if (companiesResult.success && companiesResult.companies) {
      const found = companiesResult.companies.find((c) => c.id === companyId);
      if (found) {
        this.company.set(found);
      } else {
        this.router.navigate(['/manager/dashboard']);
        return;
      }
    }

    // 2. Get Workers (Manager only)
    if (this.isManager()) {
      const workersResult = await this.companyService.getCompanyWorkers(companyId);
      if (workersResult.success && workersResult.workers) {
        this.workers.set(workersResult.workers);
      }
    }

    // 3. Get Work Entries (Manager sees all, Worker sees own via updated service logic)
    const entriesResult = await this.workEntryService.getCompanyWorkEntries(companyId);
    if (entriesResult.success && entriesResult.entries) {
      this.entries.set(entriesResult.entries);
    }

    this.isLoading.set(false);
  }

  viewEntry(entry: WorkEntry): void {
    this.selectedEntry.set(entry);
  }

  closeEntryDetail(): void {
    this.selectedEntry.set(null);
  }

  async approveEntry(entry: WorkEntry): Promise<void> {
    const result = await this.workEntryService.approveEntry(entry.id);
    if (result.success) {
      this.snackBar.open(
        this.transloco.translate('manager.entries.approved'),
        this.transloco.translate('common.close'),
        { duration: 3000 }
      );
      this.closeEntryDetail();
      // Refresh entries
      const entriesResult = await this.workEntryService.getCompanyWorkEntries(this.id());
      if (entriesResult.success && entriesResult.entries) {
        this.entries.set(entriesResult.entries);
      }
    } else {
      this.snackBar.open(
        result.error || 'Error',
        this.transloco.translate('common.close'),
        { duration: 5000 }
      );
    }
  }

  async disputeEntry(entry: WorkEntry): Promise<void> {
    const reason = prompt(this.transloco.translate('manager.entries.disputeReason'));
    if (!reason) return;

    const result = await this.workEntryService.disputeEntry(entry.id, reason);
    if (result.success) {
      this.snackBar.open(
        this.transloco.translate('manager.entries.disputed'),
        this.transloco.translate('common.close'),
        { duration: 3000 }
      );
      this.closeEntryDetail();
      // Refresh entries
      const entriesResult = await this.workEntryService.getCompanyWorkEntries(this.id());
      if (entriesResult.success && entriesResult.entries) {
        this.entries.set(entriesResult.entries);
      }
    }
  }

  // copyInvitationCode removed - handled by component
}

