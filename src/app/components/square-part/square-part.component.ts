import { TimesService } from './../../services/times.service';
import { TableService } from './../../services/table.service';
import { Component, OnInit } from '@angular/core';
import { tesValuesSquare } from 'src/tes-values';

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

  types: string[] = this.getTypes();

  sizex: number = 100;
  sizey: number = 100;
  typeSquare: string = this.types[0];
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

  getTypes(): string[] {
    let types: string[] = [];
    tesValuesSquare.forEach((x) => {
      types.push(x.type);
    });
    return types;
  }

  onSubmit() {
    const parts = this.timesService.calculateSquare(
      this.sizex,
      this.sizey,
      this.amount,
      this.typeSquare
    );

    this.amount = 1;
    this.tableService.tableData.next(parts);
  }
}
