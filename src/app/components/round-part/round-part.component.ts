import { TableService } from '../../services/table.service';
import { TimesService } from '../../services/times.service';
import { VentPart } from '../../VentPart';
import { Component, OnInit } from '@angular/core';
import { tesValues, cats } from 'src/tes-values';

@Component({
  selector: 'app-round-part',
  templateUrl: './round-part.component.html',
  styleUrls: ['./round-part.component.scss'],
})
export class RoundPartComponent implements OnInit {
  // onSubmitData: Subject = new Subject();
  constructor(
    private timesService: TimesService,
    private tableService: TableService
  ) {}

  sizes: number[] = [];
  types: string[] = [];
  cats = cats;

  size: number;
  type: string;
  amount: number = 1;

  // parts: VentPart;

  ngOnInit(): void {
    this.getSizes();
    this.type = this.types[0];
  }

  getSizes() {
    Object.entries(tesValues[0])
      .filter(([key, _value]) => key != 'Type')
      .forEach(([key, _value]) => {
        key === 'Toru' ? this.types.unshift(key) : this.types.push(key);
      });
    console.log(this.types);

    tesValues.forEach((element) => {
      this.sizes.push(element.Type);
    });
    console.log(this.sizes);
    this.size = this.sizes[0];
  }

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
    const parts: VentPart = this.timesService.calculateHours(
      this.size,
      this.amount,
      this.type
    );
    this.amount = 1;
    this.tableService.tableData.next(parts);
  }
}
