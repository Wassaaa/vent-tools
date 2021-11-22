import { AnalyticsService } from './../../../services/analytics.service';
import { HttpService } from './../../../services/http.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-amount-button',
  templateUrl: './amount-button.component.html',
  styleUrls: ['./amount-button.component.scss'],
})
export class AmountButtonComponent implements OnInit {
  constructor(private http: HttpService, private anal: AnalyticsService) {}

  amount: number;
  unit: string;

  ngOnInit(): void {
    this.http.amountData.subscribe((x) => (this.amount = x));
    this.http.unitData.subscribe((x) => (this.unit = x));
  }

  setAmount(value: number) {
    if (value > 0) {
      this.http.amountData.next(value);
    } else {
      this.http.amountData.next(1);
    }
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

  analytics() {
    this.anal.eventEmitter('submit_form', 'form', 'click', 'submit', 1);
  }
}
