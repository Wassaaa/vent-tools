import { VentPart } from './../../VentPart';
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
    private tableService: TableService
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
