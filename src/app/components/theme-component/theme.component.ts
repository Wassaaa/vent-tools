import { DataService } from './../../services/data.service';

import {
  Component,
  ElementRef,
  HostBinding,
  OnInit,
  Renderer2,
} from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';

const THEME_DARKNESS_SUFFIX = `-dark`;

@Component({
  selector: 'app-theme-component',
  templateUrl: './theme.component.html',
  styleUrls: ['./theme.component.scss'],
})
export class ThemeComponent implements OnInit {
  @HostBinding('class') activeThemeCssClass: string;
  isThemeDark = true;
  activeTheme: string;
  themes: string[] = [
    'deeppurple-amber',
    'indigo-pink',
    'pink-bluegrey',
    'purple-green',
  ];

  constructor(
    private overlayContainer: OverlayContainer,
    private dataService: DataService,
    private renderer: Renderer2,
    private elref: ElementRef
  ) {
    // Set default theme here:
  }

  setActiveTheme(theme: string, darkness: boolean = this.isThemeDark) {
    if (darkness === null) darkness = this.isThemeDark;
    else if (this.isThemeDark === darkness) {
      if (this.activeTheme === theme) return;
    } else this.isThemeDark = darkness;

    this.activeTheme = theme;

    const cssClass = darkness === true ? theme + THEME_DARKNESS_SUFFIX : theme;

    const classList = this.overlayContainer.getContainerElement().classList;
    if (classList.contains(this.activeThemeCssClass))
      classList.replace(this.activeThemeCssClass, cssClass);
    else classList.add(cssClass);

    this.activeThemeCssClass = cssClass;
    localStorage.setItem('theme', cssClass);
    this.renderer.setAttribute(document.body, 'class', cssClass);
  }

  toggleDarkness() {
    this.setActiveTheme(this.activeTheme, !this.isThemeDark);
  }

  ngOnInit() {
    let savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.activeThemeCssClass = savedTheme;
      //this.setActiveTheme(savedTheme, this.isThemeDark);
    } else {
      this.setActiveTheme('deeppurple-amber', /* darkness: */ true);
    }
  }
}
