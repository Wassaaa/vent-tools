import { Component, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslocoModule } from '@jsverse/transloco';

import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    ReactiveFormsModule,
    TranslocoModule,
  ],
})
export class LoginComponent {
  private supabaseService = inject(SupabaseService);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  hidePassword = signal(true);

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
  });

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.loginForm.value;
    const result = await this.supabaseService.signIn(email!, password!);

    this.isLoading.set(false);

    if (!result.success) {
      this.errorMessage.set(result.error || 'Login failed');
    }
  }

  togglePasswordVisibility(): void {
    this.hidePassword.set(!this.hidePassword());
  }
}
