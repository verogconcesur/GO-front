import { Directive, Input, SimpleChanges, Renderer2, ElementRef, OnChanges } from '@angular/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[appHighlight]'
})
export class HighlightDirective implements OnChanges {
  @Input() searchedWords: string[];
  @Input() text: string;
  @Input() classToApply: string;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnChanges(changes: SimpleChanges): void {
    console.log(this.searchedWords, this.text);
    if (!this.searchedWords || !this.searchedWords.length || !this.classToApply) {
      this.renderer.setProperty(this.el.nativeElement, 'innerHTML', this.text);
      return;
    }

    this.renderer.setProperty(this.el.nativeElement, 'innerHTML', this.getFormattedText());
  }

  getFormattedText() {
    const re = new RegExp(`(${this.searchedWords.join('|')})`, 'g');
    return this.text.replace(re, `<span class="${this.classToApply}">$1</span>`);
  }
}
