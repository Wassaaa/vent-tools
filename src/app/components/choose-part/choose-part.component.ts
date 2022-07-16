import { AnalyticsService } from './../../services/analytics.service';
import { DataService } from './../../services/data.service';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { cats } from 'src/tes-values';
import { filter } from 'rxjs/operators';
import { FormControl, FormGroup, Validators } from '@angular/forms';

//holds Navigation and MatCard for the content

@Component({
  selector: 'app-choose-part',
  templateUrl: './choose-part.component.html',
  styleUrls: ['./choose-part.component.scss'],
})
export class ChoosePartComponent implements OnInit, AfterViewInit {
  constructor(
    private router: Router,
    private dataService: DataService,
    private anal: AnalyticsService
  ) {}
  name = new FormControl('', Validators.required);
  date = new FormControl({ value: new Date(), disabled: true }, [
    Validators.required,
  ]);

  nameDate = new FormGroup({
    date: this.date,
    name: this.name,
  });

  cats = cats;
  activeLink: string = this.router.url;
  ngOnInit(): void {
    this.name.markAsTouched();
    this.dataService.Name = this.name.value;
    this.dataService.Date = this.date.value;
    this.anal.setUpAnalytics();
    //navigate to main route on reload and set the tab correctly
    let localRoute = this.dataService.getRoute();
    if (localRoute) {
      this.activeLink = localRoute;
      this.router.navigate([localRoute]);
    }
    this.router.events.subscribe((ev) => {
      if (ev instanceof NavigationEnd) {
        this.dataService.saveRoute(this.activeLink);
      }
    });
  }

  // form = new FormGroup({
  //   first: new FormControl({value: 'Nancy', disabled: true}, Validators.required),
  //   last: new FormControl('Drew', Validators.required)
  // });

  saveDate() {
    this.dataService.Date = this.date.value;
    console.log('Changed Date');
  }
  saveName() {
    this.dataService.Name = this.name.value;
    console.log('Changed Name');
    this.name.valid ? this.date.enable() : this.date.disable();
  }

  ngAfterViewInit() {}
}
