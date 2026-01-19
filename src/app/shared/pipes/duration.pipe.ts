import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe to format decimal hours into human-readable duration.
 * Example: 2.5 -> "2h 30min"
 */
@Pipe({
  name: 'duration',
})
export class DurationPipe implements PipeTransform {
  transform(hours: number | null | undefined): string {
    if (hours == null || isNaN(hours)) {
      return '0min';
    }

    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);

    if (wholeHours < 1) {
      return `${minutes}min`;
    }

    if (minutes === 0) {
      return `${wholeHours}h`;
    }

    return `${wholeHours}h ${minutes}min`;
  }
}
