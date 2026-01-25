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
import { MatRadioModule } from '@angular/material/radio';
import { TranslocoModule } from '@jsverse/transloco';

import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatRadioModule,
    TranslocoModule,
  ],
})
export class RegisterComponent {
  private supabaseService = inject(SupabaseService);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  hidePassword = signal(true);

  registerForm = new FormGroup({
    fullName: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
    ]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
    role: new FormControl<'worker' | 'manager'>('worker', [
      Validators.required,
    ]),
  });

  async onSubmit(): Promise<void> {
    if (this.registerForm.invalid) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const { fullName, email, password, role } =
      this.registerForm.value;

    // Store English role values in database
    const dbRole = role === 'manager' ? 'manager' : 'worker';

    const result = await this.supabaseService.signUp(
      email!,
      password!,
      fullName!,
      dbRole, // Use English value
    );

    this.isLoading.set(false);

    if (result.success) {
      this.successMessage.set('Rekisteröityminen onnistui!');
      // No navigation - registration is in drawer, will show profile automatically
    } else {
      this.errorMessage.set(result.error || 'Registration failed');
    }
  }

  togglePasswordVisibility(): void {
    this.hidePassword.set(!this.hidePassword());
  }
}
