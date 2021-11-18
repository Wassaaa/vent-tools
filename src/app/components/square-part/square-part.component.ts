import { HttpService } from './../../services/http.service';
import { TimesService } from './../../services/times.service';
import { TableService } from './../../services/table.service';
import { Component, OnInit } from '@angular/core';
import { tesValuesSquare } from 'src/tes-values';

@Component({
  selector: 'app-square-part',
  templateUrl: './square-part.component.html',
  styleUrls: ['./square-part.component.scss'],
})
export class SquarePartComponent implements OnInit {
  constructor(
    private tableService: TableService,
    private timesService: TimesService,
    private http: HttpService
  ) {}
  //label for the Mat-Slider
  formatLabel = (value: number) => value + 'mm';

  //fill arrays and initialize starting positions for the form elements
  types: string[] = this.getTypes();

  sizex: number = 100;
  sizey: number = 100;
  typeSquare: string = this.types[0];

  ngOnInit(): void {
    this.http.unitData.next('tk');
  }

  //gets types array for the MatSelect for Type
  getTypes(): string[] {
    let types: string[] = [];
    tesValuesSquare.forEach((x) => {
      types.push(x.type);
    });
    return types;
  }

  typeChage(type: string) {}

  onSubmit() {
    //sends stuff from MatSelects to calculator in TimesService
    const parts = this.timesService.calculateSquare(
      this.sizex,
      this.sizey,
      this.http.amountData.value,
      this.typeSquare
    );
    //resets amount to 1
    this.http.amountData.next(1);
    //send data to the table throught tableService Subject
    this.tableService.tableData.next(parts);
  }
}
