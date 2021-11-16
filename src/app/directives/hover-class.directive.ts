import {
  Directive,
  HostListener,
  ElementRef,
  Input,
  Renderer2,
} from '@angular/core';

@Directive({
  selector: '[hover-class]',
})
export class HoverClassDirective {
  constructor(public el: ElementRef, public renderer: Renderer2) {}
  @Input('hover-class') hoverClass: any;

  @HostListener('mouseenter') onMouseEnter() {
    //this.el.nativeElement.classList.add(this.hoverClass);
    //this.renderer.removeClass(this.el.nativeElement, 'mat-primary');
    this.renderer.addClass(this.el.nativeElement, this.hoverClass);
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.renderer.removeClass(this.el.nativeElement, this.hoverClass);
    //.renderer.addClass(this.el.nativeElement, 'mat-primary');
  }
}
