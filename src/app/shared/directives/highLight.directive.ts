import { Directive, Input, SimpleChanges, Renderer2, ElementRef, OnChanges } from '@angular/core';
import { normalizaStringToLowerCase } from '@shared/utils/string-normalization-lower-case';

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
    if (!this.searchedWords || !this.searchedWords.length || !this.classToApply) {
      this.renderer.setProperty(this.el.nativeElement, 'innerHTML', this.text);
      return;
    }

    this.renderer.setProperty(this.el.nativeElement, 'innerHTML', this.getFormattedText());
  }

  getFormattedText() {
    let textNormalized = normalizaStringToLowerCase(this.text);
    this.searchedWords.map((s) => normalizaStringToLowerCase(s));
    const re = new RegExp(`(${this.searchedWords.join('|')})`, 'g');
    textNormalized = textNormalized.replace(re, `<mark class="${this.classToApply}">$1<emark>`);
    return this.replaceMarksInOriginalText(textNormalized, this.text);
  }

  replaceMarksInOriginalText(textNormalized: string, original: string): string {
    const initialMark = `<mark class="${this.classToApply}">`;
    const endMark = '<emark>';
    let pos = textNormalized.indexOf(initialMark);
    if (pos >= 0) {
      original = `${original.substring(0, pos)}${initialMark}${original.substring(pos)}`;
      pos = textNormalized.indexOf('<emark>');
      original = `${original.substring(0, pos)}</mark>${original.substring(pos)}`;
    }
    return original;
  }
}
