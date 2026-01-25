import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

import { SupabaseService } from '../../core/services/supabase.service';
import { CompanyService } from '../../core/services/company.service';
import type { Company } from '../../core/models/database.types';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatExpansionModule,
    MatListModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    TranslocoModule,
  ],
})
export class ProfileComponent implements OnInit {
  private supabaseService = inject(SupabaseService);
  private companyService = inject(CompanyService);
  private router = inject(Router);
  private transloco = inject(TranslocoService);
  private snackBar = inject(MatSnackBar);

  user = this.supabaseService.user;
  profile = this.supabaseService.profile;
  isManager = this.supabaseService.isManager;

  isJoiningCompany = signal(false);
  joinError = signal<string | null>(null);
  joinSuccess = signal(false);
  joinedCompanies = signal<Company[]>([]);

  joinForm = new FormGroup({
    invitationCode: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(8),
    ]),
  });

  async ngOnInit(): Promise<void> {
    await this.loadCompanies();
  }

  async loadCompanies(): Promise<void> {
    const result = await this.companyService.getUserCompanies();
    if (result.success && result.companies) {
      this.joinedCompanies.set(result.companies);
    }
  }

  async onJoinCompany(): Promise<void> {
    if (this.joinForm.invalid) {
      return;
    }

    this.isJoiningCompany.set(true);
    this.joinError.set(null);
    this.joinSuccess.set(false);

    const { invitationCode } = this.joinForm.value;
    const result = await this.supabaseService.requestCompanyJoin(
      invitationCode!,
    );

    this.isJoiningCompany.set(false);

    if (result.success) {
      this.joinSuccess.set(true);
      this.joinForm.reset();
    } else {
      this.joinError.set(
        result.error || this.transloco.translate('auth.joinFailure'),
      );
    }
  }

  async onLeaveCompany(companyId: string): Promise<void> {
    if (!confirm(this.transloco.translate('profile.leaveConfirm'))) {
      return;
    }

    const result = await this.companyService.leaveCompany(companyId);
    if (result.success) {
      this.snackBar.open(
        this.transloco.translate('profile.leaveSuccess'),
        this.transloco.translate('common.close'),
        { duration: 3000 },
      );
      await this.loadCompanies();
    } else {
      this.snackBar.open(
        result.error || this.transloco.translate('profile.leaveFail'),
        this.transloco.translate('common.close'),
        { duration: 5000 },
      );
    }
  }

  async onSignOut(): Promise<void> {
    await this.supabaseService.signOut();
    this.router.navigate(['/']);
  }
}
