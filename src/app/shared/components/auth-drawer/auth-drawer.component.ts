import { MatIconModule } from '@angular/material/icon';
import { Component, inject, input, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslocoModule } from '@jsverse/transloco';
import { SupabaseService } from '../../../core/services/supabase.service';
import { LoginComponent } from '../../../features/auth/login.component';
import { ProfileComponent } from '../../../features/auth/profile.component';
import { RegisterComponent } from '../../../features/auth/register.component';
import { SideDrawerComponent } from '../side-drawer/side-drawer.component';

@Component({
  selector: 'app-auth-drawer',
  templateUrl: './auth-drawer.component.html',
  styleUrl: './auth-drawer.component.scss',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    TranslocoModule,
    LoginComponent,
    RegisterComponent,
    ProfileComponent,
    SideDrawerComponent,
  ],
})
export class AuthDrawerComponent {
  isOpen = input<boolean>(false);
  closeDrawer = output<void>();

  private supabaseService = inject(SupabaseService);

  user = this.supabaseService.user;
  isAuthenticated = this.supabaseService.isAuthenticated;

  selectedTab = signal(0);

  close(): void {
    this.closeDrawer.emit();
  }

  onLoginSuccess(): void {
    this.selectedTab.set(2); // Switch to profile tab (not showing in tabs when logged in)
  }

  onRegisterSuccess(): void {
    this.selectedTab.set(0); // Switch to login tab to login
  }
}
