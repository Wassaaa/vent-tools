import { AnalyticsService } from './../../services/analytics.service';
import { DataService } from './../../services/data.service';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { cats } from 'src/tes-values';
import { filter } from 'rxjs/operators';

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

  cats = cats;
  activeLink: string = this.router.url;
  ngOnInit(): void {
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

  ngAfterViewInit() {}
}
