import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-side-drawer',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, TranslocoModule],
  template: `
    <aside class="side-drawer" [class.open]="isOpen()" [style.width]="width()">
      <!-- Header -->
      <header class="drawer-header">
        <h2>{{ title() }}</h2>
        <button mat-icon-button (click)="close()" [attr.aria-label]="'common.close' | transloco">
          <mat-icon>close</mat-icon>
        </button>
      </header>

      <!-- Content -->
      <div class="drawer-content">
        <ng-content></ng-content>
      </div>

      <!-- Footer -->
      <footer class="drawer-footer">
        <ng-content select="[footer]"></ng-content>
      </footer>
    </aside>
  `,
  styleUrl: './side-drawer.component.scss'
})
export class SideDrawerComponent {
  isOpen = input.required<boolean>();
  title = input.required<string>();
  width = input<string>('320px');
  
  closeDrawer = output<void>();

  close() {
    this.closeDrawer.emit();
  }
}
