import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { WorkEntryStatus } from '@core/models/database.types';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadgeComponent {
  status = input.required<WorkEntryStatus>();
  size = input<number>(24);
}
