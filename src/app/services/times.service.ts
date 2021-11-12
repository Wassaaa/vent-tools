import { VentPart } from './../VentPart';
import { Injectable } from '@angular/core';
import { tesValuesSquare, round } from 'src/tes-values';

@Injectable({
  providedIn: 'root',
})
export class TimesService {
  constructor() {}

  // calculateHours(size: number, amount: number, type: string): VentPart {
  //   let timeCalc: any = tesValues.find((x) => x.Type == size);
  //   timeCalc = timeCalc[type] * amount;
  //   const newPart: VentPart = {
  //     size: size,
  //     sizeString: `${size} mm`,
  //     type: type,
  //     amount: amount,
  //     timeUsed: timeCalc,
  //     timeString: this.calculation(timeCalc),
  //   };

  //   console.log(newPart);
  //   return newPart;
  // }

  calculateHours(size: number, amount: number, type: string) {
    type = type.toLowerCase();
    console.log(`size: ${size} amount: ${amount} type: ${type}`);

    let timeCalc: any = round.find((x) => x.name === type);
    timeCalc = timeCalc[size] * amount;

    const newPart: VentPart = {
      size: size,
      sizeString: `${size} mm`,
      type: type,
      amount: amount,
      timeUsed: timeCalc,
      timeString: this.calculation(timeCalc),
    };

    console.log(newPart);
    return newPart;
  }

  calculateSquare(
    sizex: number,
    sizey: number,
    amount: number,
    type: string
  ): VentPart {
    let size: number = ((sizex + sizey) * 2) / 1000;
    // console.log(size, amount, type);
    let timeCalc: any = tesValuesSquare.find((x) => x.Type == type);
    //console.log(timeCalc['Mult'] * amount);
    timeCalc = timeCalc['Mult'] * size * amount;

    const newPart: VentPart = {
      size: size,
      type: type,
      amount: amount,
      timeUsed: timeCalc,
      timeString: this.calculation(timeCalc),
      sizeString: `${sizex} x ${sizey} mm`,
    };
    console.log(newPart);
    return newPart;
  }

  calculation(hours: number): string {
    let rhours = Math.floor(hours);
    let rminutes = Math.round((hours - rhours) * 60);
    return rhours < 1
      ? `${rminutes} minutit.`
      : `${rhours}t ja ${rminutes} minutit`;
  }
}
