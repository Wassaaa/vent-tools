import { Component, inject, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-code-badge',
  imports: [MatIconModule, MatTooltipModule],
  template: `
    <div
      class="code-badge"
      (click)="copyCode()"
      [matTooltip]="tooltip() || ''"
    >
      <mat-icon class="icon">vpn_key</mat-icon>
      <span class="code">{{ code() }}</span>
      <mat-icon class="copy-icon">content_copy</mat-icon>
    </div>
  `,
  styleUrl: './code-badge.component.scss',
})
export class CodeBadgeComponent {
  code = input.required<string>();
  tooltip = input<string>();

  private snackBar = inject(MatSnackBar);
  private transloco = inject(TranslocoService);

  copyCode(): void {
    const code = this.code();
    if (code) {
      navigator.clipboard.writeText(code);
      this.snackBar.open(
        this.transloco.translate('manager.create.copyCode'),
        this.transloco.translate('common.close'),
        { duration: 3000 },
      );
    }
  }
}
