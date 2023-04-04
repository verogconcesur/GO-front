import { Directive, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

export interface IAutoCompleteScrollEvent {
  autoComplete: MatAutocomplete;
  scrollEvent: Event;
}

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'mat-autocomplete[optionsScroll]',
  exportAs: 'mat-autocomplete[optionsScroll]'
})
export class MatAutocompleteOptionsScrollDirective implements OnDestroy {
  @Output() optionsScroll = new EventEmitter<IAutoCompleteScrollEvent>();
  private onDestroy$ = new Subject();
  constructor(public autoComplete: MatAutocomplete) {
    this.autoComplete.opened
      .pipe(
        tap(() => {
          // Note: When autocomplete raises opened, panel is not yet created (by Overlay)
          // Note: The panel will be available on next tick
          // Note: The panel wil NOT open if there are no options to display
          setTimeout(() => {
            // Note: remove listner just for safety, in case the close event is skipped.
            this.removeScrollEventListener();
            this.autoComplete.panel.nativeElement.addEventListener('scroll', this.onScroll.bind(this));
          });
        }),
        takeUntil(this.onDestroy$)
      )
      .subscribe();

    this.autoComplete.closed
      .pipe(
        tap(() => this.removeScrollEventListener()),
        takeUntil(this.onDestroy$)
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.onDestroy$.next(true);
    this.onDestroy$.complete();
    this.removeScrollEventListener();
  }

  onScroll(event: Event) {
    const scrollTop = (event.target as HTMLElement).scrollTop;
    const scrollHeight = (event.target as HTMLElement).scrollHeight;
    const elementHeight = (event.target as HTMLElement).clientHeight;
    const atBottom = scrollHeight === scrollTop + elementHeight;
    if (atBottom) {
      this.optionsScroll.next(null);
    }
  }

  private removeScrollEventListener() {
    if (this.autoComplete?.panel) {
      this.autoComplete.panel.nativeElement.removeEventListener('scroll', this.onScroll);
    }
  }
}
