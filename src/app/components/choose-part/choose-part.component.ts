import { TimesService } from './../../services/times.service';
import { VentPart } from './../../VentPart';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { tesValues, cats } from 'src/tes-values';

@Component({
  selector: 'app-choose-part',
  templateUrl: './choose-part.component.html',
  styleUrls: ['./choose-part.component.scss'],
})
export class ChoosePartComponent implements OnInit {
  @Output() onSubmitData: EventEmitter<VentPart> = new EventEmitter();

  constructor(private timesService: TimesService) {}

  ngOnInit(): void {
    this.getSizes();
    this.type = this.types[0];
  }

  sizes: number[] = [];
  types: string[] = [];
  cats = cats;

  size: number;
  type: string;
  amount: number = 1;
  cat: string = cats[0];

  parts: VentPart;

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
    this.parts = this.timesService.calculateHours(
      this.size,
      this.amount,
      this.type
    );
    this.amount = 1;
    this.onSubmitData.emit(this.parts);
  }

  getSizes() {
    //get all types from tesvalues
    // Object.entries(tesValues[0]).forEach(([key, _value]) => {
    //   if (key == 'Toru') {
    //     this.types.unshift(key);
    //     console.log('found toru');
    //     return;
    //   }
    //   if (key == 'Type') {
    //     console.log('found type');
    //     return;
    //   }
    //   this.types.push(key);
    // });

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
}
