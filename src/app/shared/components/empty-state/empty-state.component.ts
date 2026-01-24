import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  imports: [MatIconModule],
  template: `
    <div class="empty-state-container">
      <div class="icon-circle">
        <mat-icon>{{ icon() }}</mat-icon>
      </div>
      <h3>{{ title() }}</h3>
      @if (description()) {
        <p>{{ description() }}</p>
      }
      <div class="actions">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styleUrl: './empty-state.component.scss',
})
export class EmptyStateComponent {
  icon = input.required<string>();
  title = input.required<string>();
  description = input<string>();
}
