import { VentPart } from './../VentPart';
import { Injectable } from '@angular/core';
//manage local data saving of the table info
@Injectable({ providedIn: 'root' })
export class DataService {
  getData() {
    var localData: any;

    localData = localStorage.getItem('data');
    if (!localData) {
      return false;
    }

    return JSON.parse(localData);
  }

  saveData(data: VentPart[]) {
    localStorage.setItem('data', JSON.stringify(data));
  }

  deleteData() {
    localStorage.removeItem('data');
  }
}
