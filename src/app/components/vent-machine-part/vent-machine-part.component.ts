import { HttpService } from './../../services/http.service';
import { machines, MACHINE, VENTDATA } from './../../../tes-values';
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
    private tableService: TableService,
    private http: HttpService
  ) {}

  machineTypes: MACHINE[];
  machineType: MACHINE;
  sizesMachine: string[] = [];
  sizeMachine: string = '';
  subTypes: VENTDATA[] = [];
  subType: VENTDATA;
  unmappedSize: number;

  displaySubType: boolean;
  displaySize: boolean;

  ngOnInit(): void {
    this.http.displaySize.subscribe((x) => (this.displaySize = x));
    this.http.displaySubType.subscribe((x) => (this.displaySubType = x));
    this.http.subTypes.subscribe((x) => {
      console.log(x);
      this.subTypes = x;
      this.subType = x[0];
    });
    this.machineTypes = machines;
    this.machineType = machines[0];
    this.getSizes(this.machineType);
    this.sizeMachine = this.sizesMachine[0];
  }

  typeChange(subType: VENTDATA) {
    this.http.unitData.next(subType.unit);
    this.sizesMachine = this.http.fillSizes(subType, this.machineType);
    this.sizeMachine = this.sizesMachine[0];
  }

  getSizes(type: MACHINE) {
    this.sizesMachine = this.http.getSizes(type);
    this.sizeMachine = this.sizesMachine[0];
  }

  capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  onSubmit() {
    let subTypeToSend;
    if (this.displaySubType) {
      subTypeToSend = this.subType;
    } else {
      subTypeToSend = undefined;
    }
    const parts: VentPart = this.timesService.calculateMachine(
      this.sizeMachine,
      this.http.amountData.value,
      this.machineType,
      subTypeToSend
    );
    //resets amount to 1
    this.http.amountData.next(1);
    //send data to the table throught tableService Subject
    this.tableService.tableData.next(parts);
  }
}
