import { TESSQUARE } from './../../tes-values';
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
  ): any {
    if (type !== 'Rest') {
      console.log(`not Rest: ${type}`);
      let size: number = ((sizex + sizey) * 2) / 1000;
      console.log(size, amount, type);
      let timeCalc: any = tesValuesSquare.find((x) => x.type == type);
      console.log(timeCalc['mult'] * amount);
      timeCalc = timeCalc['mult'] * size * amount;

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
    //else
    let size = (sizex / 1000) * (sizey / 1000); //rest size
    console.log(`is Rest: ${type}`);
    let timeCalc: any = tesValuesSquare.find((x) => x.type == type);
    console.log(timeCalc);
    if (timeCalc != undefined) {
      const foundTess: { [key: number]: number }[] = timeCalc.sizeRest;

      let keys: number[] = Object.keys(timeCalc.sizeRest)
        .map(Number)
        .sort((a, b) => a - b);
      let values: number[] = Object.values(timeCalc.sizeRest)
        .map(Number)
        .sort((a, b) => a - b);

      let index = values.findIndex((x) => x >= size);
      timeCalc = keys[index] * amount;
      // let multiplier: any = Object.entries<number[]>(keys).filter(
      //   ([key, value]) => {
      //     size > +key;
      //     console.log(`${size} > ${key} value: ${value}`);
      //   }
      // );
      console.log(index);
      console.log(keys);
      console.log(values);

      const newPart: VentPart = {
        size: size,
        type: type,
        amount: amount,
        timeUsed: timeCalc,
        timeString: this.calculation(timeCalc),
        sizeString: `${sizex} x ${sizey} mm`,
      };
      // console.log(multiplier);
      return newPart;
    }
  }

  calculation(hours: number): string {
    let rhours = Math.floor(hours);
    let rminutes = Math.round((hours - rhours) * 60);
    return rhours < 1
      ? `${rminutes} minutit.`
      : `${rhours}t ja ${rminutes} minutit`;
  }
}
