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
  // onSubmitData: Subject = new Subject();
  constructor(
    private timesService: TimesService,
    private tableService: TableService
  ) {}
  cats = cats;
  types: string[] = this.getTypes();
  type: string = this.types[0];
  sizes: string[] = this.getSizes(this.type);
  size: string = this.sizes[0];

  amount: number = 1;

  // parts: VentPart;

  ngOnInit(): void {
    // this.getSizes();
  }

  getTypes(): string[] {
    let types: string[] = [];
    round.forEach((element) => {
      types.push(element.name.charAt(0).toUpperCase() + element.name.slice(1));
    });
    // console.log(types);
    this.types = types;
    return types;
  }

  getSizes(type: string): string[] {
    type = type.toLowerCase();
    let sizes: string[] = Object.keys(
      round.filter((x) => x.name == type)[0]
    ).filter((x) => x != 'name');

    this.sizes = sizes;
    this.size = sizes[0];

    console.log(sizes);
    return sizes;
  }

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
      +this.size,
      this.amount,
      this.type
    );
    this.amount = 1;
    this.tableService.tableData.next(parts);
  }
}
