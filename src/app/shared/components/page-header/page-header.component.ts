import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-page-header',
  imports: [RouterLink, MatIconModule],
  template: `
    <header class="page-header">
      <div class="title-group">
        @if (backUrl()) {
          <a [routerLink]="backUrl()" class="back-link">
            <mat-icon>arrow_back</mat-icon>
            {{ backLabel() }}
          </a>
        }
        <div class="main-title">
          <h1>{{ title() }}</h1>
          <ng-content select="[badges]"></ng-content>
        </div>
        @if (subtitle()) {
          <p class="subtitle">{{ subtitle() }}</p>
        }
      </div>
      <div class="actions">
        <ng-content select="[actions]"></ng-content>
      </div>
    </header>
  `,
  styleUrl: './page-header.component.scss',
})
export class PageHeaderComponent {
  title = input.required<string>();
  subtitle = input<string>();
  backUrl = input<string>();
  backLabel = input<string>();
}
