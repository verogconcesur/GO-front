import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import WorkflowStateDTO from '@data/models/workflows/workflow-state-dto';
import WorkflowSubstateDTO from '@data/models/workflows/workflow-substate-dto';
import { WorkflowAdministrationStatesSubstatesService } from '@data/services/workflow-administration-states-substates.service';
import { CustomDialogService } from '@jenga/custom-dialog';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { moveItemInFormArray } from '@shared/utils/moveItemInFormArray';
import { NGXLogger } from 'ngx-logger';
import { finalize, take } from 'rxjs/operators';
import { WorkflowsCreateEditAuxService } from '../../../aux-service/workflows-create-edit-aux.service';
import { WorkflowStepAbstractClass } from '../workflow-step-abstract-class';
import {
  WfEditStateComponentModalEnum,
  WfEditStateDialogComponent
} from './modals/wf-edit-state-dialog/wf-edit-state-dialog.component';
import { WEditSubstateFormAuxService } from './modals/wf-edit-substate-dialog/aux-service/wf-edit-substate-aux.service';
import {
  WfEditSubstateComponentModalEnum,
  WfEditSubstateDialogComponent
} from './modals/wf-edit-substate-dialog/wf-edit-substate-dialog.component';
import WorkflowStateSubstatesLengthValidator from './validators/workflow-states-substates-length.validator';

@Component({
  selector: 'app-workflow-states',
  templateUrl: './workflow-states.component.html',
  styleUrls: ['./workflow-states.component.scss']
})
export class WorkflowStatesComponent extends WorkflowStepAbstractClass implements OnInit {
  @Input() workflowId: number;
  @Input() stepIndex: number;
  public substateModified = false;

  public labels = {
    stateName: marker('workflows.stateName'),
    substateName: marker('workflows.substateName'),
    newState: marker('workflows.newState'),
    newSubstate: marker('workflows.newSubstate'),
    nameRequired: marker('userProfile.nameRequired'),
    addState: marker('workflows.addState'),
    addSubstate: marker('workflows.addSubstate')
  };

  constructor(
    private fb: UntypedFormBuilder,
    public workflowsCreateEditAuxService: WorkflowsCreateEditAuxService,
    private editSubstateAuxService: WEditSubstateFormAuxService,
    private spinnerService: ProgressSpinnerDialogService,
    public confirmationDialog: ConfirmDialogService,
    public translateService: TranslateService,
    private wStatesService: WorkflowAdministrationStatesSubstatesService,
    private globalMessageService: GlobalMessageService,
    private logger: NGXLogger,
    private customDialogService: CustomDialogService
  ) {
    super(workflowsCreateEditAuxService, confirmationDialog, translateService);
  }

  ngOnInit(): void {
    this.initListener();
  }

  public initListener(): void {
    this.editSubstateAuxService.saveAction$.pipe(untilDestroyed(this)).subscribe((saveAction) => {
      this.substateModified = true;
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public initForm(data: any): void {
    const states = data?.states ? data.states : [];
    this.form = this.fb.group(
      {
        states: this.fb.array(states.map((state: WorkflowStateDTO) => this.newStateFormGroup(state)))
      },
      {
        validators: WorkflowStateSubstatesLengthValidator.fbArrayLengthValidation('states')
      }
    );
  }

  public newStateFormGroup(state?: WorkflowStateDTO): UntypedFormGroup {
    const substates = state?.workflowSubstates ? state.workflowSubstates : [];
    return this.fb.group(
      {
        id: [state?.id ? state.id : null],
        name: [state?.name ? state.name : null, [Validators.required]],
        anchor: [state?.anchor ? state.anchor : false],
        color: [state?.color ? state.color : ''],
        front: [state?.front ? state.front : false],
        hideBoard: [state?.hideBoard ? state.hideBoard : false],
        locked: [state?.locked ? state.locked : false],
        orderNumber: [state?.orderNumber ? state.orderNumber : null, [Validators.required]],
        workflowSubstates: this.fb.array(substates.map((substate) => this.newSubstateFormGroup(substate)))
      },
      {
        validators: WorkflowStateSubstatesLengthValidator.fbArrayLengthValidation('workflowSubstates')
      }
    );
  }

  public newSubstateFormGroup(substate: WorkflowSubstateDTO): UntypedFormGroup {
    return this.fb.group({
      color: [substate?.color ? substate.color : ''],
      entryPoint: [substate?.entryPoint ? substate.entryPoint : false],
      exitPoint: [substate?.exitPoint ? substate.exitPoint : false],
      hideBoard: [substate?.hideBoard ? substate.hideBoard : false],
      id: [substate?.id ? substate.id : null],
      locked: [substate?.locked ? substate.locked : false],
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

  public getSubstatesFormArray(state: UntypedFormGroup): UntypedFormArray {
    if (state?.controls?.workflowSubstates) {
      return state.controls.workflowSubstates as UntypedFormArray;
    }
    return this.fb.array([]);
  }

  public addState(): void {
    const spinner = this.spinnerService.show();
    this.wStatesService
      .createWorkflowState(this.workflowId, {
        id: null,
        name: this.translateService.instant(this.labels.newState),
        anchor: false,
        color: '',
        front: false,
        hideBoard: false,
        locked: false,
        orderNumber: (this.form.controls.states as UntypedFormArray).controls.length + 1,
        workflow: {
          id: this.workflowId,
          name: null,
          status: null
        },
        workflowSubstates: []
      })
      .pipe(
        take(1),
        finalize(() => {
          this.spinnerService.hide(spinner);
        })
      )
      .subscribe(
        async (data) => {
          await this.getWorkflowStepData();
          this.initForm(this.originalData);
        },
        (error) => {
          this.logger.error(error);
          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
        }
      );
  }

  public deleteState(state: WorkflowStateDTO): void {
    this.confirmationDialog
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('common.deleteConfirmation'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          const spinner = this.spinnerService.show();
          this.wStatesService
            .deleteWorkflowState(this.workflowId, state.id)
            .pipe(
              take(1),
              finalize(() => {
                this.spinnerService.hide(spinner);
              })
            )
            .subscribe(
              async (data) => {
                await this.getWorkflowStepData();
                this.initForm(this.originalData);
              },
              (error) => {
                this.logger.error(error);
                this.globalMessageService.showError({
                  message: error.message,
                  actionText: this.translateService.instant(marker('common.close'))
                });
              }
            );
        }
      });
  }

  public deleteSubstate(state: WorkflowStateDTO, substate: WorkflowSubstateDTO): void {
    this.confirmationDialog
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('common.deleteConfirmation'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          const spinner = this.spinnerService.show();
          this.wStatesService
            .deleteWorkflowSubstate(this.workflowId, state.id, substate.id)
            .pipe(
              take(1),
              finalize(() => {
                this.spinnerService.hide(spinner);
              })
            )
            .subscribe(
              async (data) => {
                await this.getWorkflowStepData();
                this.initForm(this.originalData);
              },
              (error) => {
                this.logger.error(error);
                this.globalMessageService.showError({
                  message: error.message,
                  actionText: this.translateService.instant(marker('common.close'))
                });
              }
            );
        }
      });
  }

  public addSubstate(state: WorkflowStateDTO): void {
    const spinner = this.spinnerService.show();
    this.wStatesService
      .createWorkflowSubstate(this.workflowId, state.id, {
        id: null,
        name: this.translateService.instant(this.labels.newSubstate),
        color: '',
        entryPoint: false,
        exitPoint: false,
        hideBoard: false,
        locked: false,
        orderNumber: state.workflowSubstates.length + 1,
        workflowSubstateUser: [],
        cards: [],
        workflowSubstateEvents: []
      })
      .pipe(
        take(1),
        finalize(() => {
          this.spinnerService.hide(spinner);
        })
      )
      .subscribe(
        async (data) => {
          await this.getWorkflowStepData();
          this.initForm(this.originalData);
        },
        (error) => {
          this.logger.error(error);
          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
        }
      );
  }

  /** Drag and drop */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public dropState(event: CdkDragDrop<any>): void {
    moveItemInFormArray(this.form.controls.states as UntypedFormArray, event.previousIndex, event.currentIndex);
    const spinner = this.spinnerService.show();
    this.wStatesService
      .editOrderWorkflowStates(
        this.workflowId,
        this.form.controls.states.value.map((state: WorkflowStateDTO) => ({ ...state, anchor: false }))
      )
      .pipe(
        take(1),
        finalize(() => {
          this.spinnerService.hide(spinner);
        })
      )
      .subscribe(
        async (data) => {
          await this.getWorkflowStepData();
          this.initForm(this.originalData);
        },
        async (error) => {
          this.logger.error(error);
          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
          await this.getWorkflowStepData();
          this.initForm(this.originalData);
        }
      );
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public dropSubstate(event: CdkDragDrop<any>, state: UntypedFormGroup): void {
    moveItemInFormArray(state.controls.workflowSubstates as UntypedFormArray, event.previousIndex, event.currentIndex);
    const spinner = this.spinnerService.show();
    const stateValue = state.value;
    stateValue.anchor = false;
    stateValue.workflowSubstates.map((substate: WorkflowSubstateDTO) => ({
      ...substate,
      anchor: false,
      workflowState: { id: stateValue.id }
    }));
    this.wStatesService
      .editOrderWorkflowSubstates(this.workflowId, stateValue)
      .pipe(
        take(1),
        finalize(() => {
          this.spinnerService.hide(spinner);
        })
      )
      .subscribe(
        async (data) => {
          await this.getWorkflowStepData();
          this.initForm(this.originalData);
        },
        async (error) => {
          this.logger.error(error);
          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
          await this.getWorkflowStepData();
          this.initForm(this.originalData);
        }
      );
  }
  /** END Drag and drop */

  public edit(state: WorkflowStateDTO, substate?: WorkflowSubstateDTO): void {
    let id: string = WfEditStateComponentModalEnum.ID;
    let panelClass: string = WfEditStateComponentModalEnum.PANEL_CLASS;
    if (substate) {
      id = WfEditSubstateComponentModalEnum.ID;
      panelClass = WfEditSubstateComponentModalEnum.PANEL_CLASS;
    }
    this.customDialogService
      .open({
        id,
        panelClass,
        component: substate ? WfEditSubstateDialogComponent : WfEditStateDialogComponent,
        extendedComponentData: { state, substate, workflowId: this.workflowId },
        disableClose: true,
        width: substate ? '850px' : '700px'
      })
      .subscribe(async (res) => {
        if (res || this.substateModified) {
          this.substateModified = false;
          await this.getWorkflowStepData();
          this.initForm(this.originalData);
        }
      });
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
            this.originalData = {
              states: data
                ? data.sort((a, b) => {
                    if (a.anchor) {
                      return -1;
                    }
                    if (b.anchor) {
                      return 1;
                    }
                    return a.orderNumber - b.orderNumber;
                  })
                : []
            };
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
