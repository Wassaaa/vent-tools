import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { cats } from 'src/tes-values';

@Component({
  selector: 'app-choose-part',
  templateUrl: './choose-part.component.html',
  styleUrls: ['./choose-part.component.scss'],
})
export class ChoosePartComponent implements OnInit {
  constructor(private router: Router) {}

  cats = cats;
  activeLink: string = this.router.url;
  ngOnInit(): void {
    this.router.navigate(['']);
    this.activeLink = 'round';
  }
}
