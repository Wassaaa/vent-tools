import { Router } from '@angular/router';
import { VentPart } from './../VentPart';
import { Injectable, OnInit, Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// import { Firestore } from '@angular/fire/firestore';
// import { addDoc, collection } from 'firebase/firestore';
//manage local data saving of the table info
@Injectable({ providedIn: 'root' })
export class DataService implements OnInit {
  constructor(
    private router: Router,
    private http: HttpClient // private firestore: Firestore
  ) {}

  // name: string;
  // date: Date;
  //url: string = `https://my-project-1510584208007-default-rtdb.europe-west1.firebasedatabase.app/${this.Name}/${this.Date}.Json`;

  get Name(): string {
    var localName: any = localStorage.getItem('name');
    return !localName ? '' : localName;
  }

  set Name(val: string) {
    //this.name = val;
    localStorage.setItem('name', val);
  }

  get Date(): number {
    var value = new Date();
    value.setHours(0, 0, 0, 0);

    var localDate: any = localStorage.getItem('date');
    if (typeof localDate == 'string') {
      value.setTime(+localDate);
    }
    var time = value.getTime();
    return time;
    // return this.date;
  }
  set Date(val: number) {
    //this.date = val;
    localStorage.setItem('date', val.toString());
  }

  ngOnInit() {}
  getData() {
    var localData: any = localStorage.getItem('data');
    return !localData ? false : JSON.parse(localData);
  }

  saveData(data: VentPart[]) {
    let url: string = `https://my-project-1510584208007-default-rtdb.europe-west1.firebasedatabase.app/${this.Name}/${this.Date}.json`;
    localStorage.setItem('data', JSON.stringify(data));
    this.http.post(url, data).subscribe((response) => console.log(response));
    // const db = collection(this.firestore, 'data');
    // const objData = data.map((obj) => {
    //   return Object.assign({}, obj);
    // });
    // console.log(objData);
    // addDoc(db, objData)
    //   .then((response) => {
    //     console.log(response);
    //   })
    //   .catch((err) => {
    //     console.log(err.message);
    //   });
  }

  deleteData() {
    localStorage.removeItem('data');
    let url: string = `https://my-project-1510584208007-default-rtdb.europe-west1.firebasedatabase.app/${this.Name}/${this.Date}.json`;
  }

  saveRoute(route: string) {
    localStorage.setItem('route', route);
  }
  getRoute() {
    return localStorage.getItem('route');
  }
}
