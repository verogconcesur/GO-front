import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[appTwoDigitDecimal]'
})
export class TwoDigitDecimalDirective {
  @Input() decimals = 2;
  private specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 'Del', 'Delete', '-'];

  constructor(private el: ElementRef) {}

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (this.specialKeys.indexOf(event.key) !== -1) {
      return;
    }

    const current: string = this.el.nativeElement.value;
    const position = this.el.nativeElement.selectionStart;
    const next: string =
      [current.slice(0, position), event.key === 'Decimal' ? '.' : event.key, current.slice(position)].join('');

    const regex = new RegExp('^-?\\d*\\.?\\d{0,' + this.decimals.toString() + '}$', 'g');

    if (next && !String(next).match(regex)) {
      event.preventDefault();
    }
  }
}
