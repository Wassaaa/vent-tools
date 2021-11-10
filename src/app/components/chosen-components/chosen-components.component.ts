import { DataService } from './../../services/data.service';
import { VentPart } from './../../VentPart';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTable } from '@angular/material/table';

@Component({
  selector: 'app-chosen-components',
  templateUrl: './chosen-components.component.html',
  styleUrls: ['./chosen-components.component.scss'],
})
export class ChosenComponentsComponent implements OnInit {
  @ViewChild(MatTable) table: MatTable<VentPart>;

  constructor(private dataService: DataService) {}

  myDataSource: VentPart[] = [];

  displayedColumns: string[] = ['size', 'type', 'amount', 'timeString'];
  // dataSource = ELEMENT_DATA

  calculation() {
    let sum: number = 0;
    if (this.myDataSource)
      for (let row of this.myDataSource) {
        if (row.timeUsed != 0) sum += row.timeUsed;
      }
    return sum;
  }

  updateTable(data: VentPart) {
    console.log(this.myDataSource.unshift(data));
    if (!this.table) {
      return;
    }
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
    this.dataService.deleteData();
    this.myDataSource = [];
  }
  ngOnInit(): void {
    let loadedData: VentPart[] = this.dataService.getData();
    if (!loadedData) {
      return;
    }
    this.myDataSource = loadedData;
  }
}
