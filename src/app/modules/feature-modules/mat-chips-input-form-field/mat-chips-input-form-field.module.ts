import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsInputFormFieldComponent } from './mat-chips-input-form-field.component';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  declarations: [MatChipsInputFormFieldComponent],
  imports: [CommonModule, SharedModule],
  exports: [MatChipsInputFormFieldComponent]
})
export class MatChipsInputFormFieldModule {}
