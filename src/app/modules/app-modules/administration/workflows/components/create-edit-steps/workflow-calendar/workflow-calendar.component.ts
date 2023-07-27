import { Component, Input, OnInit } from '@angular/core';
import { WorkflowsCreateEditAuxService } from '../../../aux-service/workflows-create-edit-aux.service';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { TranslateService } from '@ngx-translate/core';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { WorkflowStepAbstractClass } from '../workflow-step-abstract-class';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { WorkflowAdministrationService } from '@data/services/workflow-administration.service';
import { WorkflowAdministrationStatesSubstatesService } from '@data/services/workflow-administration-states-substates.service';
import { forkJoin, take } from 'rxjs';
import WorkflowStateDTO from '@data/models/workflows/workflow-state-dto';
import CombinedRequiredFieldsValidator from '@shared/validators/combined-required-fields.validator';

@Component({
  selector: 'app-workflow-calendar',
  templateUrl: './workflow-calendar.component.html',
  styleUrls: ['./workflow-calendar.component.scss']
})
export class WorkflowCalendarComponent extends WorkflowStepAbstractClass {
  @Input() workflowId: number;
  @Input() stepIndex: number;
  public workflowStates: WorkflowStateDTO[] = [];
  constructor(
    private fb: UntypedFormBuilder,
    public workflowsCreateEditAuxService: WorkflowsCreateEditAuxService,
    public confirmationDialog: ConfirmDialogService,
    public translateService: TranslateService,
    public workflowService: WorkflowAdministrationService,
    public workflowStateService: WorkflowAdministrationStatesSubstatesService,
    private spinnerService: ProgressSpinnerDialogService
  ) {
    super(workflowsCreateEditAuxService, confirmationDialog, translateService);
  }

  public initForm(data: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    workflowHoursLimits: any;
    workflowStates: WorkflowStateDTO[];
  }): void {
    this.workflowStates = data?.workflowStates ? data.workflowStates : [];
    this.form = this.fb.group(
      {
        cardsLimit: [data?.workflowHoursLimits?.cardsLimit ? true : false],
        initTime: [data?.workflowHoursLimits?.initTime],
        endTime: [data?.workflowHoursLimits?.endTime],
        numCardsByHour: [data?.workflowHoursLimits?.numCardsByHour],
        cardsByDayLimit: [data?.workflowHoursLimits?.numCardsByDay ? true : false],
        numCardsByDay: [data?.workflowHoursLimits?.numCardsByDay],
        allowOverLimit: [data?.workflowHoursLimits?.allowOverLimit ? true : false],
        substateTargetId: [
          data?.workflowHoursLimits?.substateTargetId && this.workflowStates?.length
            ? this.workflowStates.find((d) => d.id === data.workflowHoursLimits.substateTargetId.id)
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
        this.workflowService.getWorkflowHoursLimitsConfiguration(this.workflowId).pipe(take(1)),
        this.workflowStateService.getWorkflowStatesAndSubstates(this.workflowId).pipe(take(1))
      ];
      forkJoin(resquests).subscribe(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (responses: [any, WorkflowStateDTO[]]) => {
          this.originalData = {
            workflowHoursLimits: responses[0],
            workflowStates: responses[1] ? responses[1] : []
          };
          this.spinnerService.hide(spinner);
          resolve(true);
        },
        (errors) => {
          console.log(errors);
          this.spinnerService.hide(spinner);
        }
      );
    });
  }

  public async saveStep(): Promise<boolean> {
    const spinner = this.spinnerService.show();
    return new Promise((resolve, reject) => {
      // const listRoles = this.form.getRawValue().card;
      // this.workflowService
      //   .postWorkflowCard(this.workflowId, listRoles)
      //   .pipe(
      //     take(1),
      //     finalize(() => {
      //       this.spinnerService.hide(spinner);
      //       resolve(true);
      //     })
      //   )
      //   .subscribe({
      //     next: (response) => {
      //       console.log(response);
      //     },
      //     error: (err) => {
      //       this.logger.error(err);
      //       resolve(false);
      //     }
      //   });
    });
  }
}
