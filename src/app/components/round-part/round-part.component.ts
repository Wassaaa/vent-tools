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
    private tableService: TableService
  ) {}

  //generate arrays for the select groups and initialize vars for MatSelect defaults
  cats = cats;
  types: string[] = this.getTypes();
  type: string = this.types[0];
  sizes: string[] = this.getSizes(this.type);
  size: string = this.sizes[0];

  amount: number = 1;

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
    type = type.toLowerCase();
    let sizes: string[] = Object.keys(
      round.filter((x) => x.name == type)[0]
    ).filter((x) => x != 'name');

    this.sizes = sizes;
    this.size = sizes[0];

    //console.log(sizes);
    return sizes;
  }

  //old getSizes
  // getSizes() {
  //   Object.entries(tesValues[0])
  //     .filter(([key, _value]) => key != 'Type')
  //     .forEach(([key, _value]) => {
  //       key === 'Toru' ? this.types.unshift(key) : this.types.push(key);
  //     });
  //   console.log(this.types);

  //   tesValues.forEach((element) => {
  //     this.sizes.push(element.Type);
  //   });
  //   console.log(this.sizes);
  //   this.size = this.sizes[0];
  // }

  //buttons for the amount + and - / and submit form
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
      +this.size,
      this.amount,
      this.type
    );
    //resets amount to 1
    this.amount = 1;
    //send data to the table throught tableService Subject
    this.tableService.tableData.next(parts);
  }
}
