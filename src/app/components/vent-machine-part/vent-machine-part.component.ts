import { machines, MACHINE, SUBMACHINE } from './../../../tes-values';
import { TableService } from './../../services/table.service';
import { TimesService } from './../../services/times.service';
import { Component, OnInit } from '@angular/core';
import { VentPart } from 'src/app/VentPart';

@Component({
  selector: 'app-vent-machine-part',
  templateUrl: './vent-machine-part.component.html',
  styleUrls: ['./vent-machine-part.component.scss'],
})
export class VentMachinePartComponent implements OnInit {
  constructor(
    private timesService: TimesService,
    private tableService: TableService
  ) {}

  machineTypes: MACHINE[] = [];
  machineType: MACHINE;
  sizesMachine: string[] = [];
  sizeMachine: string = '';
  subTypes: SUBMACHINE[] = [];
  subType: SUBMACHINE;

  displaySubType: boolean = false;
  displaySize: boolean = true;

  amount: number = 1;

  ngOnInit(): void {
    this.machineTypes = machines;
    this.machineType = machines[0];
    this.getSizes();
    this.sizeMachine = this.sizesMachine[0];
  }

  getSizes(): string[] {
    let displayType: number;
    let myMachine: MACHINE;
    let currentMachine = this.machineTypes.find(
      (x) => x.name === this.machineType.name
    );

    if (currentMachine && currentMachine.types) {
      this.machineType = currentMachine;
      this.subTypes = currentMachine.types;
      this.subType = currentMachine.types[0];
      let test = Object.values(currentMachine.types);
      myMachine = currentMachine;
      displayType = myMachine.displayType;
      //console.log(myMachine);
      console.log(test);

      switch (displayType) {
        case 1: //m3/s
          console.log('case 1');
          this.displaySize = true;
          this.displaySubType = false;
          this.fillSizes(this.machineType.types[0]);
          break;

        case 2: //subtype m3/s
          console.log('case 2');
          this.displaySize = true;
          this.displaySubType = true;
          this.getSubTypes();
          break;

        case 3: //small machines per piece, remove size select
          console.log('case 3');
          this.displaySize = false;
          this.displaySubType = true;
          this.getSubTypes();
          break;

        case 4: //weight difference
          console.log('case 4');
          this.displaySize = true;
          this.displaySubType = false;
          this.fillSizes(this.machineType.types[0]);
          break;

        case 5: //length difference
          console.log('case 5');
          this.displaySize = true;
          this.displaySubType = false;
          this.fillSizes(this.machineType.types[0]);
          break;
      }
    }
    return [];
  }

  mapSizes(returnSizes: number[]): string[] {
    let endValue = returnSizes
      .sort((a, b) => a - b)
      .map((x) => this.stringSize(x, this.machineType.sub));
    //console.log(returnSizes);
    //console.log(endValue);
    return endValue;
  }

  fillSizes(myType: SUBMACHINE): void {
    const returnSizes: any[] = [];

    Object.keys(myType).forEach((element) => {
      if (myType && myType[+element]) {
        returnSizes.push(+element);
        console.log(`pushed ${element} to ${myType}`);
      }
    });
    this.sizesMachine = this.mapSizes(returnSizes);
    this.sizeMachine = this.sizesMachine[0];
  }

  getSubTypes() {
    this.subTypes = [];
    const finalSizes: number[] = [];
    this.machineType.types.forEach((element) => {
      console.log(`pushed ${element} to ${this.subTypes}`);
      this.subTypes.push(element);
    });
    this.fillSizes(this.subType);
    // this.subType = this.subTypes[0];
    //sizes//
  }

  stringSize(size: number | string, sub: string): string {
    return `${size} (${sub})`;
  }

  getTypes(): MACHINE[] {
    // machines.forEach((element) => {
    //   types.push(element.name.charAt(0).toUpperCase() + element.name.slice(1));
    // });
    //console.log(types);
    //this.types = types;
    return machines;
  }
  capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  addCount() {
    console.log('added');
    this.amount++;
  }

  reduceCount() {
    console.log('decreased');
    if (this.amount > 1) {
      this.amount--;
    }
  }

  onSubmit() {
    //sends stuff from MatSelects to calculator in TimesService
    const parts: VentPart = this.timesService.calculateHours(
      +this.sizeMachine,
      this.amount,
      this.machineType.name
    );
    //resets amount to 1
    this.amount = 1;
    //send data to the table throught tableService Subject
    this.tableService.tableData.next(parts);
  }
}
