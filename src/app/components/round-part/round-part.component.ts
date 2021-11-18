import { HttpService } from './../../services/http.service';
import { TableService } from '../../services/table.service';
import { TimesService } from '../../services/times.service';
import { VentPart } from '../../VentPart';
import { Component, OnInit } from '@angular/core';
import { cats, round } from 'src/tes-values';

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
  cats = cats;
  types: string[] = this.getTypes();
  type: string = this.types[0];
  sizes: string[] = this.getSizes(this.type);
  size: string = this.sizes[0];

  // amount: number = 1;
  // parts: VentPart;

  ngOnInit(): void {}

  //gets all types for the type MatSelect, runs once
  getTypes(): string[] {
    let types: string[] = [];
    round.forEach((element) => {
      types.push(element.name.charAt(0).toUpperCase() + element.name.slice(1));
    });
    // console.log(types);
    this.types = types;
    return types;
  }

  //get sizes for the size MatSelect, changes every time depending on the Type data.
  getSizes(type: string): string[] {
    let oldSize = this.size;
    type = type.toLowerCase();
    let sizes: string[] = Object.keys(
      round.filter((x) => x.name == type)[0]
    ).filter((x) => x != 'name');

    let currentType = round.find((x) => x.name == type);
    if (currentType != undefined) {
      this.http.unitData.next(currentType.unit);
    }

    this.sizes = sizes;
    this.size = sizes.includes(oldSize) ? oldSize : sizes[0];

    //console.log(sizes);
    return sizes;
  }

  onSubmit() {
    //sends stuff from MatSelects to calculator in TimesService
    const parts: VentPart = this.timesService.calculateHours(
      +this.size,
      this.http.amountData.value,
      this.type
    );
    //resets amount to 1
    this.http.amountData.next(1);
    //send data to the table throught tableService Subject
    this.tableService.tableData.next(parts);
  }
}
