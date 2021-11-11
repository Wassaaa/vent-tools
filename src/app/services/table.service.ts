import { VentPart } from './../VentPart';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TableService {
  tableData = new Subject<VentPart>();
}
