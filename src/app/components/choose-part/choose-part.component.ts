import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { cats } from 'src/tes-values';

//holds Navigation and MatCard for the content

@Component({
  selector: 'app-choose-part',
  templateUrl: './choose-part.component.html',
  styleUrls: ['./choose-part.component.scss'],
})
export class ChoosePartComponent implements OnInit, AfterViewInit {
  constructor(private router: Router) {}

  cats = cats;
  activeLink: string = this.router.url;
  ngOnInit(): void {
    //navigate to main route on reload and set the tab correctly
    this.router.navigate(['']);
    this.activeLink = 'round';
  }

  ngAfterViewInit() {
    // document
    //   .getElementsByClassName('mat-tab-header-pagination-before')[0]
    //   .remove();
    // document
    //   .getElementsByClassName('mat-tab-header-pagination-after')[0]
    //   .remove();
  }
}
