import { TimesService } from './services/times.service';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'duration',
  //pure: false,
})
export class DurationPipe implements PipeTransform {
  constructor(private timesService: TimesService) {}
  transform(value: number): string {
    if (value === 0) {
      return '';
    }
    return this.timesService.calculation(value);
  }
}
