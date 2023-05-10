import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, UntypedFormArray, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { ActivatedRoute, Router } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CardColumnDTO from '@data/models/cards/card-column-dto';
import CardColumnTabDTO from '@data/models/cards/card-column-tab-dto';
import CardColumnTabItemDTO from '@data/models/cards/card-column-tab-item-dto';
import CardCreateDTO from '@data/models/cards/card-create-dto';
import CardDTO from '@data/models/cards/card-dto';
import WorkflowDTO from '@data/models/workflows/workflow-dto';
import WorkflowSubstateDTO from '@data/models/workflows/workflow-substate-dto';
import WorkflowSubstateEventDTO from '@data/models/workflows/workflow-substate-event-dto';
import { CardService } from '@data/services/cards.service';
import { WorkflowsService } from '@data/services/workflows.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { NGXLogger } from 'ngx-logger';
import { take, finalize } from 'rxjs/operators';

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
    back: marker('common.back'),
    save: marker('common.save'),
    information: marker('cards.column.information')
  };
  public contentTypeAvailable = [1, 2];
  public contentSourceAvailable = [1, 2, 3, 6];
  public cardDetailSelected: CardDTO;
  public subStateSelected: WorkflowSubstateDTO;
  public currentWorkflowId: number;
  public steplist: { title: string; index: number }[] = [];
  public stepIndex = 1;
  public formWorkflow: FormGroup;
  public formStep1: FormGroup;
  public formStep2: FormGroup;
  constructor(
    public dialogRef: MatDialogRef<NewCardComponent>,
    private fb: FormBuilder,
    private spinnerService: ProgressSpinnerDialogService,
    private confirmationDialog: ConfirmDialogService,
    private translateService: TranslateService,
    private globalMessageService: GlobalMessageService,
    private cardsService: CardService,
    private logger: NGXLogger,
    private workflowService: WorkflowsService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.initializeSteps();
    this.initializeWorkflowForm();
    this.workflowService.workflowSelectedSubject$.pipe(untilDestroyed(this)).subscribe((workflow: WorkflowDTO) => {
      this.currentWorkflowId = workflow?.id;
    });
  }

  public onSubmitCustomDialog(): void {
    this.confirmationDialog
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('newCard.saveConfirmation'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          let cardBody: CardCreateDTO = {
            workflowId: this.formWorkflow.get('workflow').value.id,
            workflowSubstateId: this.formWorkflow.get('subState').value.id,
            facilityId: this.formWorkflow.get('facility').value.id,
            cardInstance: {
              vehicleId: null,
              customerId: null,
              information: null,
              vehicleInventoryId: null,
              userId: null,
              repairOrderId: null
            },
            cardInstanceWorkflowUsers: []
          };
          if (this.formWorkflow.get('subStateUser').value) {
            cardBody.cardInstanceWorkflowUsers.push({ user: { id: this.formWorkflow.get('subStateUser').value.id } });
          }
          cardBody = this.completeDataCardIntance(cardBody, this.formStep1);
          cardBody = this.completeDataCardIntance(cardBody, this.formStep2);
          const spinner = this.spinnerService.show();

          this.cardsService
            .createCardInstance(cardBody)
            .pipe(
              take(1),
              finalize(() => this.spinnerService.hide(spinner))
            )
            .subscribe({
              next: () => {
                this.redirectTo([
                  RouteConstants.DASHBOARD,
                  RouteConstants.WORKFLOWS,
                  cardBody.workflowId,
                  RouteConstants.WORKFLOWS_BOARD_VIEW
                ]);
                this.dialogRef.close();
              },
              error: (error: ConcenetError) => {
                this.logger.error(error);
                this.globalMessageService.showError({
                  message: error.message,
                  actionText: this.translateService.instant(marker('common.close'))
                });
              }
            });
        }
      });
  }
  public redirectTo(uri: unknown[]) {
    this.router.navigate([RouteConstants.DASHBOARD], { skipLocationChange: true }).then(() => this.router.navigate(uri));
  }
  public closeModal(): void {
    this.confirmationDialog
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('newCard.exitConfirmation'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          this.dialogRef.close();
        }
      });
  }
  public prevStep(): void {
    this.stepIndex = this.stepIndex - 1;
    this.stepper.previous();
  }
  public nextStep(): void {
    if (
      this.stepIndex === 1 &&
      (!this.subStateSelected || this.subStateSelected.id !== this.formWorkflow.get('subState').value.id)
    ) {
      const spinner = this.spinnerService.show();
      this.subStateSelected = this.formWorkflow.get('subState').getRawValue();
      this.cardsService
        .getCardCreateTabData(this.formWorkflow.get('workflow').value.id)
        .pipe(take(1))
        .subscribe((res) => {
          this.cardDetailSelected = res;
          this.initializeStep1Form();
          this.initializeStep2Form();
          this.stepIndex = this.stepIndex + 1;
          this.stepper.next();
          this.spinnerService.hide(spinner);
        });
    } else {
      this.stepIndex = this.stepIndex + 1;
      this.stepper.next();
    }
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
  private completeDataCardIntance(cardBody: CardCreateDTO, step: FormGroup): CardCreateDTO {
    step
      .getRawValue()
      .tabs.forEach(
        (tab: {
          contentSourceId: number;
          customerId: number;
          vehicleId: number;
          vehicleInventoryId: number;
          userId: number;
          repairOrderId: number;
          information: string;
        }) => {
          switch (tab.contentSourceId) {
            case 1:
              cardBody.cardInstance.customerId = tab.customerId;
              break;
            case 2:
              cardBody.cardInstance.vehicleId = tab.vehicleId;
              cardBody.cardInstance.vehicleInventoryId = tab.vehicleInventoryId;
              break;
            case 3:
              cardBody.cardInstance.userId = tab.userId;
              break;
            case 6:
              cardBody.cardInstance.repairOrderId = tab.repairOrderId;
              break;
            case null:
              cardBody.cardInstance.information = tab.information;
              break;
          }
        }
      );
    return cardBody;
  }
  private initializeStep1Form(): void {
    const column: CardColumnDTO = this.cardDetailSelected.cols.find((col) => col.orderNumber === 1);
    this.steplist[1].title = column.name;
    this.formStep1 = this.fb.group({
      tabs: this.generateTabsFormArray(column)
    });
  }
  private initializeStep2Form(): void {
    const column: CardColumnDTO = this.cardDetailSelected.cols.find((col) => col.orderNumber === 2);
    this.steplist[2].title = column.name;
    this.formStep2 = this.fb.group({
      tabs: this.generateTabsFormArray(column)
    });
  }
  private generateTabsFormArray(column: CardColumnDTO): FormArray {
    const arrayForm = this.fb.array([]);
    if (column.orderNumber === 2) {
      const tabForm = this.fb.group({
        name: [this.translateService.instant(this.labels.information)],
        contentTypeId: [null],
        contentSourceId: [null],
        customerId: [''],
        vehicleId: [''],
        userId: [''],
        repairOrderId: [''],
        vehicleInventoryId: [''],
        information: ['', Validators.required]
      });
      (arrayForm as UntypedFormArray).push(tabForm);
    }
    column.tabs.forEach((tab) => {
      if (
        this.contentTypeAvailable.includes(tab.contentTypeId) &&
        (!tab.contentSourceId || this.contentSourceAvailable.includes(tab.contentSourceId))
      ) {
        const tabForm = this.fb.group({
          id: [tab.id],
          name: [tab.name],
          idCard: [column.cardId],
          orderNumber: [tab.orderNumber],
          colId: [tab.colId],
          type: [tab.type],
          contentTypeId: [tab.contentTypeId],
          contentSourceId: [tab.contentSourceId],
          tabItems: this.generateTabItemsFormArray(tab),
          customerId: [''],
          vehicleId: [''],
          userId: [''],
          repairOrderId: [''],
          vehicleInventoryId: [''],
          information: ['']
        });
        (arrayForm as UntypedFormArray).push(tabForm);
      }
    });
    return arrayForm;
  }
  private generateTabItemsFormArray(tab: CardColumnTabDTO): FormArray {
    const arrayForm = this.fb.array([]);
    switch (tab.contentTypeId) {
      case 1:
        tab.tabItems
          .filter((tabItem) => {
            switch (tabItem.typeItem) {
              case 'VARIABLE':
                return tabItem.tabItemConfigVariable.visible;
              case 'ACTION':
                return tabItem.tabItemConfigAction.visible;
            }
            return false;
          })
          .forEach((tabItem) => {
            (arrayForm as UntypedFormArray).push(this.generateEntityTabItem(tabItem));
          });
        break;
    }
    return arrayForm;
  }
  private generateEntityTabItem(tabItem: CardColumnTabItemDTO): FormGroup {
    let subStateEventList = this.formWorkflow.get('subState').value.workflowSubstateEvents as WorkflowSubstateEventDTO[];
    if (!subStateEventList) {
      subStateEventList = [];
    }
    const subStateEvent = subStateEventList.find((event: WorkflowSubstateEventDTO) => event.requiredFields);
    if (
      subStateEvent &&
      subStateEvent.requiredFieldsList.find((tabItemSubState: CardColumnTabItemDTO) => tabItemSubState.id === tabItem.id)
    ) {
      return this.fb.group({ id: [tabItem.id], label: [tabItem.name], value: ['', Validators.required] });
    } else {
      return this.fb.group({ id: [tabItem.id], label: [tabItem.name], value: [''] });
    }
  }
  private initializeWorkflowForm(): void {
    this.formWorkflow = this.fb.group({
      workflow: ['', Validators.required],
      facility: ['', Validators.required],
      entryState: ['', Validators.required],
      subState: ['', Validators.required],
      subStateUser: ['']
    });
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
