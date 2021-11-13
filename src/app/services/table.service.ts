import { VentPart } from './../VentPart';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TableService {
  //Subject used to send data from all form components to Table component
  tableData = new Subject<VentPart>();
}
