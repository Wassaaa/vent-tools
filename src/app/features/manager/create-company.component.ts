import { Component, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterLink } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import type { Company } from '../../core/models/database.types';
import { CompanyService } from '../../core/services/company.service';

@Component({
  selector: 'app-create-company',
  templateUrl: './create-company.component.html',
  styleUrl: './create-company.component.scss',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    TranslocoModule,
  ],
})
export class CreateCompanyComponent {
  private companyService = inject(CompanyService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private transloco = inject(TranslocoService);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  createdCompany = signal<Company | null>(null);

  companyForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2)]),
  });

  async onSubmit(): Promise<void> {
    if (this.companyForm.invalid) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { name } = this.companyForm.value;
    const result = await this.companyService.createCompany(name!);

    this.isLoading.set(false);

    if (result.success && result.company) {
      this.createdCompany.set(result.company);
      this.snackBar.open(
        this.transloco.translate('manager.create.success'),
        this.transloco.translate('common.close'),
        {
          duration: 5000,
        },
      );
    } else {
      this.errorMessage.set(
        result.error || this.transloco.translate('manager.create.failure'),
      );
    }
  }

  copyInvitationCode(): void {
    const code = this.createdCompany()?.invitation_code;
    if (code) {
      navigator.clipboard.writeText(code);
      this.snackBar.open(
        this.transloco.translate('manager.create.copyCode'),
        this.transloco.translate('common.close'),
        {
          duration: 3000,
        },
      );
    }
  }

  createAnother(): void {
    this.createdCompany.set(null);
    this.companyForm.reset();
  }
}
