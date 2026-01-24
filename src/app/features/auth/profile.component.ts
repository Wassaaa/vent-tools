import { Component, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    TranslocoModule,
  ],
})
export class ProfileComponent {
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);
  private transloco = inject(TranslocoService);

  user = this.supabaseService.user;
  profile = this.supabaseService.profile;
  isManager = this.supabaseService.isManager;

  isJoiningCompany = signal(false);
  joinError = signal<string | null>(null);
  joinSuccess = signal(false);

  joinForm = new FormGroup({
    invitationCode: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(8),
    ]),
  });

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

  async onSignOut(): Promise<void> {
    await this.supabaseService.signOut();
    this.router.navigate(['/auth/login']);
  }
}
