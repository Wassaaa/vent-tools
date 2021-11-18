import { HttpService } from './../../../services/http.service';
import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-amount-button',
  templateUrl: './amount-button.component.html',
  styleUrls: ['./amount-button.component.scss'],
})
export class AmountButtonComponent implements OnInit {
  constructor(private http: HttpService) {}

  amount: number;
  unit: string;

  ngOnInit(): void {
    this.http.amountData.subscribe((x) => (this.amount = x));
    this.http.unitData.subscribe((x) => (this.unit = x));
  }

  addCount() {
    console.log('added');
    //this.amount++;

    this.http.amountData.next(this.http.amountData.value + 1);
  }

  reduceCount() {
    if (this.amount > 1) {
      console.log('decreased');
      //this.amount--;
      this.http.amountData.next(this.http.amountData.value - 1);
      return;
    }
    console.log('Minimum value 1');
  }
}
