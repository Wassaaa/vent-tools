import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  //Subject used to send data from all form components to Table component

  amountData = new Subject<number>();

  constructor() {}
}
