import { TESSQUARE } from './../TES';
import { VentPart } from './../VentPart';
import { Injectable } from '@angular/core';
import { tesValues, tesValuesSquare } from 'src/tes-values';

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

  calculateSquare(size: number, amount: number, type: string): VentPart {
    console.log(size, amount, type);
    let timeCalc: any = tesValuesSquare.find((x) => x.Type == type);
    //console.log(timeCalc['Mult'] * amount);
    timeCalc = timeCalc['Mult'] * size * amount;
    console.log(timeCalc);
    const newPart: VentPart = {
      size: size.toString(),
      type: type,
      amount: amount,
      timeUsed: timeCalc,
      timeString: this.calculation(timeCalc),
    };
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
