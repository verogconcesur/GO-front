import { Component, Input, OnInit } from '@angular/core';
import { WorkflowsCreateEditAuxService } from '../../../aux-service/workflows-create-edit-aux.service';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { TranslateService } from '@ngx-translate/core';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { WorkflowStepAbstractClass } from '../workflow-step-abstract-class';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { WorkflowAdministrationService } from '@data/services/workflow-administration.service';
import { WorkflowAdministrationStatesSubstatesService } from '@data/services/workflow-administration-states-substates.service';
import { finalize, forkJoin, take } from 'rxjs';
import WorkflowStateDTO from '@data/models/workflows/workflow-state-dto';
import CombinedRequiredFieldsValidator from '@shared/validators/combined-required-fields.validator';
import WorkflowCardsLimitDTO from '@data/models/workflow-admin/workflow-card-limit-dto';
import WorkflowSubstateDTO from '@data/models/workflows/workflow-substate-dto';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { ConcenetError } from '@app/types/error';

@Component({
  selector: 'app-workflow-calendar',
  templateUrl: './workflow-calendar.component.html',
  styleUrls: ['./workflow-calendar.component.scss']
})
export class WorkflowCalendarComponent extends WorkflowStepAbstractClass {
  @Input() workflowId: number;
  @Input() stepIndex: number;
  public workflowSubstates: WorkflowSubstateDTO[] = [];
  public labels = {
    cardsLimit: marker('workflows.cardsLimit'),
    cardsLimitCheck: marker('workflows.cardsLimitCheck'),
    initTime: marker('workflows.initTime'),
    endTime: marker('workflows.endTime'),
    required: marker('errors.required'),
    valueBetween: marker('errors.valueBetween'),
    numCardsByHour: marker('workflows.numCardsByHour'),
    cardsByDayLimit: marker('workflows.cardsByDayLimit'),
    numCardsByDay: marker('workflows.numCardsByDay'),
    allowOverLimit: marker('workflows.allowOverLimit'),
    workflowSubstateTargetCardsLimit: marker('workflows.workflowSubstateTargetCardsLimit')
  };
  constructor(
    private fb: UntypedFormBuilder,
    public workflowsCreateEditAuxService: WorkflowsCreateEditAuxService,
    public confirmationDialog: ConfirmDialogService,
    public translateService: TranslateService,
    public workflowService: WorkflowAdministrationService,
    public workflowStateService: WorkflowAdministrationStatesSubstatesService,
    private spinnerService: ProgressSpinnerDialogService,
    private globalMessageService: GlobalMessageService
  ) {
    super(workflowsCreateEditAuxService, confirmationDialog, translateService);
  }

  public initForm(data: { workflowCardsLimits: WorkflowCardsLimitDTO; workflowStates: WorkflowStateDTO[] }): void {
    console.log(data, this.workflowSubstates);
    this.form = this.fb.group(
      {
        id: [data?.workflowCardsLimits?.id ? data.workflowCardsLimits.id : this.workflowId],
        cardsLimit: [data?.workflowCardsLimits?.cardsLimit ? true : false],
        initTime: [data?.workflowCardsLimits?.initTime, [Validators.max(23), Validators.min(0)]],
        endTime: [data?.workflowCardsLimits?.endTime, [Validators.max(23), Validators.min(0)]],
        numCardsByHour: [data?.workflowCardsLimits?.numCardsByHour, Validators.min(0)],
        cardsByDayLimit: [data?.workflowCardsLimits?.numCardsByDay ? true : false],
        numCardsByDay: [data?.workflowCardsLimits?.numCardsByDay, Validators.min(0)],
        allowOverLimit: [data?.workflowCardsLimits?.allowOverLimit ? true : false],
        workflowSubstate: [
          data?.workflowCardsLimits?.workflowSubstate && this.workflowSubstates?.length
            ? this.workflowSubstates.find((d) => d.id === data.workflowCardsLimits.workflowSubstate.id)
            : null
        ]
      },
      {
        validators: [
          CombinedRequiredFieldsValidator.field1RequiredIfFieldsConditions('initTime', [
            { control: 'cardsLimit', operation: 'equal', value: true }
          ]),
          CombinedRequiredFieldsValidator.field1RequiredIfFieldsConditions('endTime', [
            { control: 'cardsLimit', operation: 'equal', value: true }
          ]),
          CombinedRequiredFieldsValidator.field1RequiredIfFieldsConditions('numCardsByHour', [
            { control: 'cardsLimit', operation: 'equal', value: true }
          ]),
          CombinedRequiredFieldsValidator.field1RequiredIfFieldsConditions('numCardsByDay', [
            { control: 'cardsByDayLimit', operation: 'equal', value: true }
          ]),
          CombinedRequiredFieldsValidator.field1RequiredIfFieldsConditions('substateTargetId', [
            { control: 'allowOverLimit', operation: 'equal', value: true }
          ])
        ]
      }
    );
    console.log(data, this.form.getRawValue());
  }

  public async getWorkflowStepData(): Promise<boolean> {
    const spinner = this.spinnerService.show();
    return new Promise((resolve, reject) => {
      const resquests = [
        this.workflowService.getWorkflowCardsLimitsConfiguration(this.workflowId).pipe(take(1)),
        this.workflowStateService.getWorkflowStatesAndSubstates(this.workflowId).pipe(take(1))
      ];
      forkJoin(resquests).subscribe(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (responses: [WorkflowCardsLimitDTO, WorkflowStateDTO[]]) => {
          this.workflowSubstates = [];
          responses[1] = responses[1]?.length ? responses[1] : [];
          responses[1].forEach((state: WorkflowStateDTO) => {
            state.workflowSubstates.forEach((substate: WorkflowSubstateDTO) => {
              substate.workflowState = { ...state, workflowSubstates: [] };
              this.workflowSubstates.push(substate);
            });
          });
          this.originalData = {
            workflowCardsLimits: responses[0],
            workflowSubstates: this.workflowSubstates
          };
          this.spinnerService.hide(spinner);
          resolve(true);
        },
        (errors) => {
          let message = '';
          if (errors.length) {
            errors.forEach((e: ConcenetError) => {
              if (e.message) {
                message = message ? ` - ${e.message}` : e.message;
              }
            });
          }
          if (message) {
            this.globalMessageService.showError({
              message,
              actionText: this.translateService.instant(marker('common.close'))
            });
          }
          this.spinnerService.hide(spinner);
        }
      );
    });
  }

  public async saveStep(): Promise<boolean> {
    const spinner = this.spinnerService.show();
    return new Promise((resolve, reject) => {
      const data = this.form.getRawValue();
      this.workflowService
        .setWorkflowCardsLimitsConfiguration(data)
        .pipe(
          take(1),
          finalize(() => {
            this.spinnerService.hide(spinner);
            resolve(true);
          })
        )
        .subscribe({
          next: (response) => {},
          error: (err: ConcenetError) => {
            this.globalMessageService.showError({
              message: err.message,
              actionText: this.translateService.instant(marker('common.close'))
            });
            resolve(false);
          }
        });
    });
  }
}
