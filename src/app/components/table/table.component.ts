import { TimesService } from './../../services/times.service';
import { VentPart } from 'src/app/VentPart';
import { TableService } from './../../services/table.service';
import { DataService } from '../../services/data.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTable } from '@angular/material/table';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent implements OnInit {
  myDataSource: VentPart[] = [];
  @ViewChild(MatTable) table: MatTable<VentPart>;
  primary: string = 'primary';
  warn: string = 'warn';

  constructor(
    private dataService: DataService,
    private tableService: TableService,
    private timesService: TimesService
  ) {}

  displayedColumns: string[] = ['sizeString', 'type', 'amount', 'timeString'];
  // dataSource = ELEMENT_DATA

  ngOnInit(): void {
    this.tableService.tableData.subscribe((data) => {
      this.myDataSource.unshift(data);
      if (!this.table) {
        return;
      }
      this.table.renderRows();
      this.dataService.saveData(this.myDataSource);
    });

    let loadedData: VentPart[] = this.dataService.getData();
    if (!loadedData) {
      return;
    }
    this.myDataSource = loadedData;
  }

  onMerge() {
    let newResult: VentPart[] = []; //variable for the new merged array

    interface merge {
      //interface for my object with info needed for my merging.
      index: number;
      amount: number;
    }
    let seen = new Map<string, merge>(); //map for setting up found elements that I plan to merge

    const result = this.myDataSource.filter((element) => {
      let mySpecialKey: string = element.type + element.sizeString; //special key for my Map that consists of 2 strings added tougether that i Use for main filtering

      if (!seen.has(mySpecialKey)) {
        //if my map doesn't have current element geting iterated then set it up in my Map with the special key and merge Object,
        seen.set(mySpecialKey, {
          //index so I can find the correct array element to add amount to and amount to add onto later.
          index: newResult.length,
          amount: element.amount,
        });
        //console.log(`${element.timeUsed} / ${element.amount}`);
        element.timeUsed = element.timeUsed / element.amount;
        newResult.push(element);
        return true;
      }
      let myMerge = seen.get(element.type + element.sizeString);
      if (myMerge) {
        seen.set(mySpecialKey, {
          index: myMerge.index,
          amount: myMerge.amount + element.amount,
        });
        console.log(`${myMerge.amount} + ${element.amount}`);
        if (seen.get(mySpecialKey)) {
          let newAmount = seen.get(mySpecialKey)!.amount;
          console.log('new amount from seen: ' + newAmount);
          console.log(
            'new amount from array: ' + newResult[myMerge.index].amount
          );
          newResult[myMerge.index].amount = newAmount;
          //arr.splice(myMerge.index, 1);
        }
      }
      return false;
    });
    newResult.map((x) => {
      x.timeUsed = x.amount * x.timeUsed;
      x.timeString = this.timesService.calculation(x.timeUsed);
      return x;
    });
    // .map((v, i, a) => {
    //   console.log(v.timeUsed);
    //   v.timeString = this.timesService.calculation(v.timeUsed);
    //   return v;
    // });
    console.log(seen.values());
    console.log(result);
    this.myDataSource = newResult;
    this.table.renderRows();
  }

  calculation() {
    let sum: number = 0;
    if (this.myDataSource)
      for (let row of this.myDataSource) {
        if (row.timeUsed) {
          if (row.timeUsed != 0) sum += row.timeUsed;
        }
      }
    return sum;
  }

  removeRow(rowIndex: number) {
    this.myDataSource.splice(rowIndex, 1);
    this.table.renderRows();
    this.dataService.saveData(this.myDataSource);
  }

  showTable() {
    if (this.myDataSource.length > 0) {
      return true;
    }
    return false;
  }

  onDelete() {
    console.log(this.myDataSource);
    this.dataService.deleteData();
    this.myDataSource = [];
  }
}
