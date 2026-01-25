import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule, MatMenuPanel } from '@angular/material/menu';

@Component({
  selector: 'app-header-btn',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule, MatMenuModule],
  templateUrl: './header-btn.component.html',
  styleUrl: './header-btn.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderBtnComponent {
  // Required inputs
  icon = input.required<string>();
  label = input.required<string>();

  // Optional inputs for different modes
  link = input<string | null>(null);
  menu = input<MatMenuPanel | null>(null);
  active = input(false);

  // Click output (for standard buttons)
  action = output<void>();

  onClick(event: Event): void {
    if (!this.link() && !this.menu()) {
      this.action.emit();
    }
  }
}
