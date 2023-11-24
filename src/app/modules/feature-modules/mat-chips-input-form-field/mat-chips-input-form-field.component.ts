import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { NG_VALUE_ACCESSOR, UntypedFormControl } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER, SPACE, SEMICOLON } from '@angular/cdk/keycodes';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { TranslateService } from '@ngx-translate/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';

@Component({
  selector: 'app-mat-chips-input-form-field',
  templateUrl: './mat-chips-input-form-field.component.html',
  styleUrls: ['./mat-chips-input-form-field.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: MatChipsInputFormFieldComponent
    }
  ]
})
export class MatChipsInputFormFieldComponent implements OnInit, OnChanges {
  @Input() matFormLabel: string;
  @Input() inputPlaceholder: string;
  @Input() fControl: UntypedFormControl;
  @Input() matFormFieldClasses: string;
  @Input() inputPattern = '';
  @Input() errorPatternMessage: string;
  readonly separatorKeysCodes = [ENTER, COMMA, SPACE, SEMICOLON] as const;
  private regex: RegExp = null;
  constructor(private globalMessage: GlobalMessageService, private translateService: TranslateService) {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.inputPattern) {
      this.regex = new RegExp(this.inputPattern);
    }
  }

  public getChips(): string[] {
    return this.fControl?.value ? this.fControl.value : [];
  }

  public removeChip(chipText: string): void {
    const arr = this.fControl.value;
    const index = arr.indexOf(chipText);

    if (index >= 0) {
      arr.splice(index, 1);
      this.fControl.setValue(arr);
      this.fControl.markAsDirty();
      this.fControl.markAsTouched();
    }
  }

  public addChip(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value && (!this.regex || this.regex.test(value))) {
      this.fControl.setValue([...this.fControl.value, value]);
      this.fControl.markAsDirty();
      this.fControl.markAsTouched();
      event.chipInput.clear();
    } else if (value && this.regex && !this.regex.test(value)) {
      this.globalMessage.showError({
        message: this.translateService.instant(this.errorPatternMessage),
        actionText: this.translateService.instant(marker('common.close'))
      });
    }
  }
}
