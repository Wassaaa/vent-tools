import { VentPart } from './../VentPart';
import { Injectable } from '@angular/core';
import { tesValues } from 'src/tes-values';

@Injectable({
  providedIn: 'root',
})
export class TimesService {
  constructor() {}

  calculateHours(size: number, amount: number, type: string): VentPart {
    let timeCalc: any = tesValues.find((x) => x.Type == size);
    timeCalc = timeCalc[type] * amount;
    const newPart: VentPart = {
      size: size,
      type: type,
      amount: amount,
      timeUsed: timeCalc,
      timeString: this.calculation(timeCalc),
    };

    //console.log(tesValues[0]);
    return newPart;
  }

  calculation(hours: number): string {
    let rhours = Math.floor(hours);
    let rminutes = Math.round((hours - rhours) * 60);
    return rhours < 1
      ? rminutes + ' minutit.'
      : rhours + 't ja ' + rminutes + ' minutit';
  }
}
