import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CardDTO from '@data/models/cards/card-dto';
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
    next: marker('common.next'),
    save: marker('common.save')
  };
  public steplist: { title: string; index: number }[] = [];
  public stepIndex = 1;
  public formWorkflow: FormGroup;
  public formStep1: FormGroup;
  public formStep2: FormGroup;
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

  public onSubmitCustomDialog(): void {}
  public nextStep(): void {
    if (this.stepIndex === 1) {
      const card: CardDTO = this.formWorkflow.get('workflow').value?.card;
      this.steplist[1].title = card.cols[0].name;
      this.steplist[2].title = card.cols[1].name;
    }
    this.stepIndex = this.stepIndex + 1;
    this.stepper.next();
  }
  public checkNextDisabled(): boolean {
    switch (this.stepIndex) {
      case 1:
        return this.formWorkflow.invalid;
      case 2:
        return this.formStep1.invalid;
      case 3:
        return this.formWorkflow.invalid || this.formStep1.invalid || this.formStep2.invalid;
      default:
        return true;
    }
  }
  private initializeForm(): void {
    this.formWorkflow = this.fb.group({
      workflow: ['', Validators.required],
      facility: ['', Validators.required],
      entryState: ['', Validators.required],
      subState: ['', Validators.required]
    });
    this.formStep1 = this.fb.group({});
    this.formStep2 = this.fb.group({});
  }
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
