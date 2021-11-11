import { VentPart } from './../../VentPart';
import { TimesService } from './../../services/times.service';
import { TableService } from './../../services/table.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-square-part',
  templateUrl: './square-part.component.html',
  styleUrls: ['./square-part.component.scss'],
})
export class SquarePartComponent implements OnInit {
  constructor(
    private tableService: TableService,
    private timesService: TimesService
  ) {}

  formatLabel = (value: number) => value + 'mm';

  types: string[] = ['Eristamata', 'Eristatud'];

  sizex: number = 100;
  sizey: number = 100;
  type: string = 'Eristamata';
  amount: number = 1;

  ngOnInit(): void {}

  addCount() {
    console.log('added');
    this.amount++;
    // let test:any = tesValues.find((x) => x.Type == 500);
    // test = test[this.type];
    // console.log(test);
  }

  reduceCount() {
    console.log('decreased');
    if (this.amount > 1) {
      this.amount--;
    }
  }

  onSubmit() {
    let size: number = ((this.sizex + this.sizey) * 2) / 1000;
    const parts = this.timesService.calculateSquare(
      size,
      this.amount,
      this.type
    );
    // const parts: VentPart = this.timesService.calculateHours(
    //   size,
    //   this.amount,
    //   this.type
    // );
    this.amount = 1;
    this.tableService.tableData.next(parts);
  }
}
