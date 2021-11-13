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

  //TES hours calculator for the Round Ventilation parts based on diameter of the connection.

  calculateHours(size: number, amount: number, type: string) {
    type = type.toLowerCase();
    //console.log(`size: ${size} amount: ${amount} type: ${type}`);

    //finds the correct multiplier for the selected pipe type and multiplies it with the amount selected
    let timeCalc: any = round.find((x) => x.name === type);
    timeCalc = timeCalc[size] * amount;

    //get the new part ready for the Table
    const newPart: VentPart = {
      size: size,
      sizeString: `${size} mm`,
      type: type,
      amount: amount,
      timeUsed: timeCalc,
      //string for the amount of hours or minutes used.
      timeString: this.calculation(timeCalc),
    };

    console.log(newPart);
    return newPart;
  }

  //TES hours calculator for the Square Ventilation parts based on Side Area of the square 'pipe'.
  //or based on the AREA of the part in the case of the "rest/säleikko"
  calculateSquare(
    sizex: number,
    sizey: number,
    amount: number,
    type: string
  ): VentPart {
    //in case of everything other that the 'rest/säleikkö'
    if (type !== 'Rest') {
      //size is the Area of the SIDE of the pipe (m2), for 1 meter of it (amount = meters of pipe installed)
      let size: number = ((sizex + sizey) * 2) / 1000;
      //console.log(size, amount, type);

      //find the correct multiplier for the selected type
      let timeCalc: any = tesValuesSquare.find((x) => x.type == type);
      //console.log(timeCalc['mult'] * amount);
      //multiply the multiplier from TES with the size in m2 and the amount of meters/parts
      timeCalc = timeCalc['mult'] * size * amount;

      //ready the Ventpart for table
      const newPart: VentPart = {
        size: size,
        type: type,
        amount: amount,
        timeUsed: timeCalc,
        timeString: this.calculation(timeCalc),
        sizeString: `${sizex} x ${sizey} mm`,
      };

      console.log(newPart);
      //send it
      return newPart;
    }

    let size = (sizex / 1000) * (sizey / 1000); //rest size pipe input area in m2

    //find the correct data for the type
    let timeCalc: any = tesValuesSquare.find((x) => x.type == type);
    console.log(timeCalc);

    //get the values of the KEYS and VALUES in sizeRest Object, and sort from lowest to highest
    let keys: number[] = Object.keys(timeCalc.sizeRest)
      .map(Number)
      .sort((a, b) => a - b);
    let values: number[] = Object.values(timeCalc.sizeRest)
      .map(Number)
      .sort((a, b) => a - b);
    //get index of the correct value for the selected size
    let index = values.findIndex((x) => x >= size);
    //calculate the TES time used
    timeCalc = keys[index] * amount;

    // console.log(index);
    // console.log(keys);
    // console.log(values);

    //get the new part ready for the Table
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
