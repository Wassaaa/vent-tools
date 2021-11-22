import { Router, NavigationEnd } from '@angular/router';
import { Injectable } from '@angular/core';
import { filter } from 'rxjs/operators';

declare let gtag: Function;
@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  //Subject used to send data from all form components to Table component

  constructor(private router: Router) {}

  public eventEmitter(
    eventName: string,
    eventCategory: string,
    eventAction: string,
    eventLabel: string,
    eventValue: number
  ) {
    gtag('event', eventName, {
      eventCategory: eventCategory,
      eventLabel: eventLabel,
      eventAction: eventAction,
      eventValue: eventValue,
    });
  }

  setUpAnalytics() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((x) => {
        if (x instanceof NavigationEnd) {
          console.log(x);
          gtag('config', 'G-3DMQR72JVC', {
            page_path: x.urlAfterRedirects,
          });
        }
      });
  }
}
