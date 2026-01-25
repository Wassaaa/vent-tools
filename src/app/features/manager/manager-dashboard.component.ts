import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

import type { Company } from '../../core/models/database.types';
import { CompanyService } from '../../core/services/company.service';
import { SupabaseService } from '../../core/services/supabase.service';
import { CodeBadgeComponent } from '../../shared/components/code-badge/code-badge.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-manager-dashboard',
  templateUrl: './manager-dashboard.component.html',
  styleUrl: './manager-dashboard.component.scss',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    RouterLink,
    TranslocoModule,
    DatePipe,
    CodeBadgeComponent,
    EmptyStateComponent,
    PageHeaderComponent,
  ],
})
export class ManagerDashboardComponent implements OnInit {
  private companyService = inject(CompanyService);
  private supabaseService = inject(SupabaseService);
  private snackBar = inject(MatSnackBar);
  private transloco = inject(TranslocoService);

  isLoading = signal(true);
  companies = signal<Company[]>([]);
  isManager = this.supabaseService.isManager;

  // Dynamic titles based on role
  pageTitle = computed(() => 'manager.dashboard.title');

  pageSubtitle = computed(() =>
    this.isManager()
      ? 'manager.dashboard.subtitle'
      : 'manager.dashboard.workerSubtitle',
  );

  async ngOnInit(): Promise<void> {
    await this.loadCompanies();
  }

  async loadCompanies(): Promise<void> {
    this.isLoading.set(true);
    const result = await this.companyService.getUserCompanies();
    this.isLoading.set(false);

    if (result.success && result.companies) {
      this.companies.set(result.companies);
    } else {
      this.snackBar.open(
        result.error || this.transloco.translate('manager.dashboard.loadFail'),
        this.transloco.translate('common.close'),
        { duration: 5000 },
      );
    }
  }
}
