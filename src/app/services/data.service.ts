import { Router } from '@angular/router';
import { VentPart } from './../VentPart';
import { Injectable, OnInit } from '@angular/core';
//manage local data saving of the table info
@Injectable({ providedIn: 'root' })
export class DataService implements OnInit {
  constructor(private router: Router) {}

  name: string;
  date: Date;

  get Name(): string {
    return this.name;
  }
  set Name(val: string) {
    this.name = val;
  }
  get Date(): Date {
    return this.date;
  }
  set Date(val: Date) {
    this.date = val;
  }

  ngOnInit() {}
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

  saveRoute(route: string) {
    localStorage.setItem('route', route);
  }
  getRoute() {
    return localStorage.getItem('route');
  }
}
