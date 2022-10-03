import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';

export const enum NewCardComponentModalEnum {
  ID = 'new-card-dialog-id',
  PANEL_CLASS = 'remove-padding',
  TITLE = 'newCard.create'
}
@Component({
  selector: 'app-new-card',
  templateUrl: './new-card.component.html',
  styleUrls: ['./new-card.component.scss'],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { displayDefaultIndicatorType: false }
    }
  ]
})
export class NewCardComponent implements OnInit {
  @ViewChild('stepper') stepper: MatStepper;
  public labels = {
    newCard: marker('newCard.newCard'),
    createCard: marker('newCard.create'),
    step: marker('newCard.step'),
    cancel: marker('common.cancel'),
    save: marker('common.save')
  };
  public steplist: object[] = [];
  public stepIndex = 1;
  constructor(
    public dialogRef: MatDialogRef<NewCardComponent>,
    private fb: FormBuilder,
    private spinnerService: ProgressSpinnerDialogService,
    private confirmDialogService: ConfirmDialogService,
    private translateService: TranslateService,
    private globalMessageService: GlobalMessageService
  ) {}

  ngOnInit() {
    this.initializeSteps();
    this.initializeForm();
  }

  public confirmCloseCustomDialog(): void {
    this.dialogRef.close();
  }

  public onSubmitCustomDialog(): void {
    this.stepIndex = this.stepIndex + 1;
    this.stepper.next();
  }
  private initializeForm(): void {}
  private initializeSteps(): void {
    this.steplist.push({
      title: this.translateService.instant(marker('newCard.workflow.title')),
      index: 1
    });
    this.steplist.push({
      title: this.translateService.instant(marker('newCard.column')) + '1',
      index: 2
    });
    this.steplist.push({
      title: this.translateService.instant(marker('newCard.column')) + '2',
      index: 3
    });
  }
}
