import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import type { CompanyJoinRequest } from '../../core/models/database.types';
import { CompanyService } from '../../core/services/company.service';

@Component({
  selector: 'app-join-requests',
  templateUrl: './join-requests.component.html',
  styleUrl: './join-requests.component.scss',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    DatePipe,
    TranslocoModule,
  ],
})
export class JoinRequestsComponent implements OnInit {
  private companyService = inject(CompanyService);
  private snackBar = inject(MatSnackBar);
  private transloco = inject(TranslocoService);

  isLoading = signal(true);
  requests = signal<
    Array<CompanyJoinRequest & { user_email?: string; user_name?: string }>
  >([]);
  processingRequests = signal<Set<string>>(new Set());

  async ngOnInit(): Promise<void> {
    await this.loadRequests();
  }

  async loadRequests(): Promise<void> {
    this.isLoading.set(true);
    const result = await this.companyService.getPendingJoinRequests();
    this.isLoading.set(false);

    if (result.success && result.requests) {
      this.requests.set(result.requests);
    }
  }

  async approveRequest(requestId: string): Promise<void> {
    const processing = new Set(this.processingRequests());
    processing.add(requestId);
    this.processingRequests.set(processing);

    const result = await this.companyService.approveJoinRequest(requestId);

    processing.delete(requestId);
    this.processingRequests.set(processing);

    if (result.success) {
      this.snackBar.open(
        this.transloco.translate('manager.join.approved'),
        this.transloco.translate('common.close'),
        {
          duration: 3000,
        },
      );
      // Remove from list
      this.requests.set(this.requests().filter((r) => r.id !== requestId));
    } else {
      this.snackBar.open(
        result.error || this.transloco.translate('manager.join.approveFail'),
        this.transloco.translate('common.close'),
        {
          duration: 5000,
        },
      );
    }
  }

  async rejectRequest(requestId: string): Promise<void> {
    const processing = new Set(this.processingRequests());
    processing.add(requestId);
    this.processingRequests.set(processing);

    const result = await this.companyService.rejectJoinRequest(requestId);

    processing.delete(requestId);
    this.processingRequests.set(processing);

    if (result.success) {
      this.snackBar.open(
        this.transloco.translate('manager.join.rejected'),
        this.transloco.translate('common.close'),
        {
          duration: 3000,
        },
      );
      // Remove from list
      this.requests.set(this.requests().filter((r) => r.id !== requestId));
    } else {
      this.snackBar.open(
        result.error || this.transloco.translate('manager.join.rejectFail'),
        this.transloco.translate('common.close'),
        {
          duration: 5000,
        },
      );
    }
  }

  isProcessing(requestId: string): boolean {
    return this.processingRequests().has(requestId);
  }
}
