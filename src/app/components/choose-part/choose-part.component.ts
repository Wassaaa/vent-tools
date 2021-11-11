import { Component, OnInit } from '@angular/core';
import { cats } from 'src/tes-values';

@Component({
  selector: 'app-choose-part',
  templateUrl: './choose-part.component.html',
  styleUrls: ['./choose-part.component.scss'],
})
export class ChoosePartComponent implements OnInit {
  constructor() {}

  cats = cats;
  activeLink = this.cats[0];
  ngOnInit(): void {}
}
