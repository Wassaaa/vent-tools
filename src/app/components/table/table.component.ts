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

    let seen = new Map<string, number>(); //map for setting up indexes that have my MAIN unique rows

    const result = this.myDataSource.filter((element) => {
      const mySpecialKey: string = element.type + element.sizeString; //special key for my Map that consists of 2 strings added tougether that i Use for main filtering
      if (!seen.has(mySpecialKey)) {
        //if my map doesn't have current element geting iterated then set its unique ID Filter string
        seen.set(mySpecialKey, newResult.length);
        element.timeUsed = element.timeUsed / element.amount; //get time data for a single object for calculating later, set it up with the unique object data
        newResult.push(element); //push unique to the new array
        return true;
      }

      let myMerge = seen.get(mySpecialKey);

      if (myMerge !== undefined) {
        //it fucking returns 0 so cant just do if(merge) FML
        let newAmount = newResult[myMerge].amount + element.amount; //add up the new duplicate element's amount data into the new array
        newResult[myMerge].amount = newAmount;
      }
      return false;
    });
    newResult.map((x) => {
      //remap the new array to include correct time calculation data, using the single piece data that I got from the start
      x.timeUsed = x.amount * x.timeUsed;
      x.timeString = this.timesService.calculation(x.timeUsed);
      return x;
    });

    console.log(newResult);
    this.myDataSource = newResult; //add it all to the data and backend
    this.dataService.saveData(this.myDataSource);
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
