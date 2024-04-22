/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, ViewEncapsulation } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { TemplatesAccountingDTO } from '@data/models/templates/templates-accounting-dto';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-create-edit-accounting',
  templateUrl: './create-edit-accounting.component.html',
  styleUrls: ['./create-edit-accounting.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CreateEditAccountingComponent {
  public accountingForm: UntypedFormGroup;
  public itemListToShow: any[] = [];
  public expansionPanelOpened: any = {};
  public accountingToEdit: TemplatesAccountingDTO = null;
  public labels: any = {
    newAccounting: marker('administration.templates.accounting.new'),
    accountingConfig: marker('administration.templates.accounting.config'),
    blocksInTemplate: marker('administration.templates.accounting.blocks')
  };

  constructor(private translateService: TranslateService) {}

  public getTitle(): string {
    if (this.accountingToEdit) {
      return this.accountingForm.value.template.name;
    }
    if (this.accountingForm?.value?.template?.name) {
      return this.translateService.instant(this.labels.newAccounting) + ': ' + this.accountingForm.value.template.name;
    }
    return this.translateService.instant(this.labels.newAccounting);
  }
}
