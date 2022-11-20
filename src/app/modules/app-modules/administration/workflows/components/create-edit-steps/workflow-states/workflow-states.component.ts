import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import WorkflowStateDTO from '@data/models/workflows/workflow-state-dto';
import WorkflowSubstateDTO from '@data/models/workflows/workflow-substate-dto';
import { WorkflowAdministrationStatesSubstatesService } from '@data/services/workflow-administration-states-substates.service';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { NGXLogger } from 'ngx-logger';
import { finalize, take } from 'rxjs/operators';
import { WorkflowsCreateEditAuxService } from '../../../aux-service/workflows-create-edit-aux.service';
import { WorkflowStepAbstractClass } from '../workflow-step-abstract-class';

@Component({
  selector: 'app-workflow-states',
  templateUrl: './workflow-states.component.html',
  styleUrls: ['./workflow-states.component.scss']
})
export class WorkflowStatesComponent extends WorkflowStepAbstractClass {
  @Input() workflowId: number;
  @Input() stepIndex: number;
  public labels = {
    stateName: marker('workflows.stateName'),
    subtateName: marker('workflows.substateName'),
    nameRequired: marker('userProfile.nameRequired')
  };

  constructor(
    private fb: UntypedFormBuilder,
    public workflowsCreateEditAuxService: WorkflowsCreateEditAuxService,
    private spinnerService: ProgressSpinnerDialogService,
    public confirmationDialog: ConfirmDialogService,
    public translateService: TranslateService,
    private wStatesService: WorkflowAdministrationStatesSubstatesService,
    private globalMessageService: GlobalMessageService,
    private logger: NGXLogger
  ) {
    super(workflowsCreateEditAuxService, confirmationDialog, translateService);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public initForm(data: any): void {
    const states = data?.states ? data.states : [];
    this.form = this.fb.group({
      states: this.fb.array(states.map((state: WorkflowStateDTO) => this.newStateFormGroup(state)))
    });
    console.log(data, this.form, this.form.value);
  }

  public newStateFormGroup(state?: WorkflowStateDTO): UntypedFormGroup {
    const substates = state?.workflowSubstates ? state.workflowSubstates : [];
    return this.fb.group({
      id: [state?.id ? state.id : null],
      name: [state?.name ? state.name : null, [Validators.required]],
      anchor: [state?.anchor ? state.anchor : null],
      color: [state?.color ? state.color : null],
      front: [state?.front ? state.front : null],
      hideBoard: [state?.hideBoard ? state.hideBoard : null],
      locked: [state?.locked ? state.locked : null],
      orderNumber: [state?.orderNumber ? state.orderNumber : null, [Validators.required]],
      workflowSubstates: this.fb.array(substates.map((substate) => this.newSubstateFormGroup(substate)))
    });
  }

  public newSubstateFormGroup(substate: WorkflowSubstateDTO): UntypedFormGroup {
    return this.fb.group({
      color: [substate?.color ? substate.color : null],
      entryPoint: [substate?.entryPoint ? substate.entryPoint : null],
      exitPoint: [substate?.exitPoint ? substate.exitPoint : null],
      hideBoard: [substate?.hideBoard ? substate.hideBoard : null],
      id: [substate?.id ? substate.id : null],
      locked: [substate?.locked ? substate.locked : null],
      name: [substate?.name ? substate.name : null, [Validators.required]],
      orderNumber: [substate?.orderNumber ? substate.orderNumber : null, [Validators.required]]
    });
  }

  public getStatesFormArray(): UntypedFormArray {
    if (this.form?.controls?.states) {
      return this.form.controls.states as UntypedFormArray;
    }
    return this.fb.array([]);
  }

  public async getWorkflowStepData(): Promise<boolean> {
    const spinner = this.spinnerService.show();
    return new Promise((resolve, reject) => {
      this.wStatesService
        .getWorkflowStatesAndSubstates(this.workflowId)
        .pipe(
          take(1),
          finalize(() => {
            this.spinnerService.hide(spinner);
          })
        )
        .subscribe(
          (data: WorkflowStateDTO[]) => {
            this.originalData = { states: data.sort((a, b) => a.orderNumber - b.orderNumber) };
            resolve(true);
          },
          (error: ConcenetError) => {
            this.logger.error(error);
            this.globalMessageService.showError({
              message: error.message,
              actionText: this.translateService.instant(marker('common.close'))
            });
            resolve(false);
          }
        );
    });
  }

  public async saveStep(): Promise<boolean> {
    const spinner = this.spinnerService.show();
    return new Promise((resolve, reject) => {
      this.spinnerService.hide(spinner);
      resolve(true);
      //resolve(false) => si se produce error
    });
  }
}
