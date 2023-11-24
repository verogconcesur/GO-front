import { Directive, ElementRef, OnInit } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[matTooltip][appShowIfTruncated]'
})
export class ShowToolbarIfTruncatedDirective implements OnInit {
  constructor(private matTooltip: MatTooltip, private elementRef: ElementRef<HTMLElement>) {}

  public ngOnInit(): void {
    // Wait for DOM update
    setTimeout(() => {
      const element = this.elementRef.nativeElement;
      this.matTooltip.disabled = element.scrollWidth <= element.clientWidth;
    });
  }
}
