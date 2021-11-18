import { MACHINE, VENTDATA } from './../../tes-values';
import { BehaviorSubject, Subject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  //Subject used to send data from all form components to Table component
  amountData = new BehaviorSubject(1);
  unitData = new BehaviorSubject('tk');
  displaySize = new BehaviorSubject(false);
  displaySubType = new BehaviorSubject(false);
  subTypes = new Subject<VENTDATA[]>();

  constructor() {}

  getSizes(type: MACHINE): string[] {
    let displayType: number;
    // let myMachine: MACHINE;
    let subTypes: VENTDATA[];
    let subType: VENTDATA;
    let currentMachine = type;
    let returnSizes: string[] = [];

    if (currentMachine && currentMachine.types) {
      type = currentMachine;
      subTypes = currentMachine.types;
      subType = currentMachine.types[0];
      //let test = Object.values(currentMachine.types);
      // myMachine = currentMachine;
      displayType = type.displayType;
      console.log(type);
      console.log(subTypes);

      switch (displayType) {
        case 1: //m3/s
          console.log('case 1');
          this.displaySize.next(true);
          this.displaySubType.next(false);
          returnSizes = this.fillSizes(type.types[0], type);
          break;

        case 2: //subtype m3/s
          console.log('case 2');
          this.displaySize.next(true);
          this.displaySubType.next(true);
          this.subTypes.next(this.getSubTypes(type));
          returnSizes = this.fillSizes(subType, type);
          break;

        case 3: //small machines per piece, remove size select
          console.log('case 3');
          this.displaySize.next(false);
          this.displaySubType.next(true);
          this.subTypes.next(this.getSubTypes(type));
          returnSizes = this.fillSizes(subType, type);
          break;

        case 4: //weight difference
          console.log('case 4');
          this.displaySize.next(true);
          this.displaySubType.next(false);
          returnSizes = this.fillSizes(type.types[0], type);
          break;

        case 5: //length difference
          console.log('case 5');
          this.displaySize.next(true);
          this.displaySubType.next(false);
          returnSizes = this.fillSizes(type.types[0], type);
          break;
      }
    }
    //this.typeChange(this.subType);
    return returnSizes;
  }
  stringSize(size: number | string, sub: string): string {
    return `${size} (${sub})`;
  }

  mapSizes(returnSizes: number[], machineType: MACHINE): string[] {
    let endValue = returnSizes
      .sort((a, b) => a - b)
      .map((x) => this.stringSize(x, machineType.sub));
    //console.log(returnSizes);
    //console.log(endValue);
    return endValue;
  }

  fillSizes(myType: VENTDATA, myMachine: MACHINE): string[] {
    const returnSizes: any[] = [];

    Object.keys(myType).forEach((element) => {
      if (myType && myType[+element]) {
        returnSizes.push(+element);
        console.log(`pushed ${element} to ${myType}`);
      }
    });
    // this.sizesMachine = this.mapSizes(returnSizes);
    console.log(returnSizes);
    return this.mapSizes(returnSizes, myMachine);

    // this.sizeMachine = this.sizesMachine[0];
  }

  getSubTypes(machineType: MACHINE): VENTDATA[] {
    let subTypes: VENTDATA[] = [];
    const finalSizes: number[] = [];
    machineType.types.forEach((element) => {
      //console.log(`pushed ${element} to ${this.subTypes}`);
      subTypes.push(element);
    });
    return subTypes;
    // this.fillSizes(subType);
    // this.subType = this.subTypes[0];
    //sizes//
  }
}
