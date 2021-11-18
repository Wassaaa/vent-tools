import { BehaviorSubject, Subject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  //Subject used to send data from all form components to Table component
  amountData = new BehaviorSubject(1);
  unitData = new BehaviorSubject('tk');

  constructor() {}
}
