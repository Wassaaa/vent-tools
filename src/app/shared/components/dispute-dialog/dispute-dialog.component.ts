import { Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-dispute-dialog',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    TranslocoModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ 'manager.entries.disputeTitle' | transloco }}</h2>
    <mat-dialog-content>
      <p>{{ 'manager.entries.disputePrompt' | transloco }}</p>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>{{ 'manager.entries.reason' | transloco }}</mat-label>
        <textarea matInput [(ngModel)]="reason" rows="4"></textarea>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>
        {{ 'common.cancel' | transloco }}
      </button>
      <button
        mat-flat-button
        color="warn"
        [mat-dialog-close]="reason()"
        [disabled]="!reason()"
      >
        {{ 'common.confirm' | transloco }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .full-width {
        width: 100%;
      }
      mat-dialog-content {
        min-width: 300px;
      }
    `,
  ],
})
export class DisputeDialogComponent {
  reason = model('');
}
