import { MACHINE } from './../../../tes-values';
import { HttpService } from './../../services/http.service';
import { TableService } from '../../services/table.service';
import { TimesService } from '../../services/times.service';
import { VentPart } from '../../VentPart';
import { Component, OnInit } from '@angular/core';
import { round } from 'src/tes-values';

@Component({
  selector: 'app-round-part',
  templateUrl: './round-part.component.html',
  styleUrls: ['./round-part.component.scss'],
})
export class RoundPartComponent implements OnInit {
  constructor(
    private timesService: TimesService,
    private tableService: TableService,
    private http: HttpService
  ) {}

  //generate arrays for the select groups and initialize vars for MatSelect defaults
  roundTypes: MACHINE[];
  roundType: MACHINE;
  roundSizes: string[];
  roundSize: string;

  ngOnInit(): void {
    this.roundTypes = round;
    this.roundType = this.roundTypes[0];
    this.getSizes(this.roundType);
    this.roundSize = this.roundSizes[0];
  }
  capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  getSizes(type: MACHINE): void {
    this.http.unitData.next(this.roundType.types[0].unit);
    this.roundSizes = this.http.getSizes(type);
    this.roundSize = this.roundSizes[0];
  }

  onSubmit() {
    //sends stuff from MatSelects to calculator in TimesService
    const parts: VentPart = this.timesService.calculateMachine(
      this.roundSize,
      this.http.amountData.value,
      this.roundType
    );
    //resets amount to 1
    this.http.amountData.next(1);
    //send data to the table throught tableService Subject
    this.tableService.tableData.next(parts);
  }
}
