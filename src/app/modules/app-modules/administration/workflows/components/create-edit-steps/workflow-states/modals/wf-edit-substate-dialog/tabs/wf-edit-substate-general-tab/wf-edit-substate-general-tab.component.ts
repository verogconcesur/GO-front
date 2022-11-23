import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, UntypedFormArray, UntypedFormGroup, Validators } from '@angular/forms';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import WorkflowStateDTO from '@data/models/workflows/workflow-state-dto';
import WorkflowSubstateDTO from '@data/models/workflows/workflow-substate-dto';
import { WorkflowAdministrationStatesSubstatesService } from '@data/services/workflow-administration-states-substates.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { NGXLogger } from 'ngx-logger';
import { finalize, take } from 'rxjs/operators';
import { TAB_IDS, WEditSubstateFormAuxService } from '../../aux-service/wf-edit-substate-aux.service';

@UntilDestroy()
@Component({
  selector: 'app-wf-edit-substate-general-tab',
  templateUrl: './wf-edit-substate-general-tab.component.html',
  styleUrls: ['./wf-edit-substate-general-tab.component.scss']
})
export class WfEditSubstateGeneralTabComponent implements OnInit {
  @Input() state: WorkflowStateDTO = null;
  @Input() substate: WorkflowSubstateDTO = null;
  @Input() workflowId: number = null;
  @Input() tabId: TAB_IDS;
  @Output() substateChanged: EventEmitter<WorkflowSubstateDTO> = new EventEmitter();

  public labels = {
    name: marker('workflows.stateName'),
    nameRequired: marker('errors.required'),
    entryPoint: marker('workflows.state-entryPoint'),
    entryPointDescription: marker('workflows.state-entryPointDescription'),
    exitPoint: marker('workflows.state-exitPoint'),
    exitPointDescription: marker('workflows.state-exitPointDescription'),
    hideBoard: marker('workflows.state-hideBoard'),
    hideBoardDescription: marker('workflows.state-hideBoardDescription'),
    lockInMoves: marker('workflows.state-lockInMoves'),
    lockInMovesDescription: marker('workflows.state-lockInMovesDescription'),
    color: marker('workflows.state-color')
  };

  constructor(
    private fb: FormBuilder,
    private editSubstateAuxService: WEditSubstateFormAuxService,
    private substatesService: WorkflowAdministrationStatesSubstatesService,
    private spinnerService: ProgressSpinnerDialogService,
    private logger: NGXLogger,
    private translateService: TranslateService,
    private globalMessageService: GlobalMessageService
  ) {}

  get form(): UntypedFormGroup {
    return this.editSubstateAuxService.getFormGroupByTab(this.tabId);
  }

  ngOnInit(): void {
    this.initListeners();
    this.initForm(this.substate);
  }

  public entryExitPointSelected(opt: 'entryPoint' | 'exitPoint'): void {
    const opposite = opt === 'entryPoint' ? 'exitPoint' : 'entryPoint';
    if (this.form.get(opt).value && this.form.get(opposite).value) {
      this.form.get(opposite).setValue(false);
      this.form.get(opposite).markAsDirty();
      this.form.get(opposite).markAsTouched();
    }
  }

  private initListeners(): void {
    this.editSubstateAuxService.saveAction$.pipe(untilDestroyed(this)).subscribe((saveAction) => {
      this.saveData();
    });
    this.editSubstateAuxService.resetForm$.pipe(untilDestroyed(this)).subscribe((resetAction) => {
      this.initForm(this.editSubstateAuxService.getFormOriginalData(this.tabId));
    });
  }

  private initForm(data: WorkflowSubstateDTO): void {
    const form = this.fb.group({
      name: [data?.name ? data.name : null, [Validators.required]],
      entryPoint: [data?.entryPoint ? data.entryPoint : false],
      exitPoint: [data?.exitPoint ? data.exitPoint : false],
      hideBoard: [data?.hideBoard ? data.hideBoard : false],
      locked: [data?.locked ? data.locked : false],
      color: [data?.color ? data.color : '']
    });
    this.editSubstateAuxService.setFormGroupByTab(form, this.tabId);
    this.editSubstateAuxService.setFormOriginalData(this.form.value, this.tabId);
  }

  private saveData(): void {
    const spinner = this.spinnerService.show();
    this.substatesService
      .createWorkflowSubstate(this.workflowId, this.state.id, { ...this.substate, ...this.form.value })
      .pipe(
        take(1),
        finalize(() => this.spinnerService.hide(spinner))
      )
      .subscribe({
        next: (response: WorkflowSubstateDTO) => {
          this.substateChanged.emit(response);
          this.initForm(response);
          this.editSubstateAuxService.setFormOriginalData(this.form.value, this.tabId);
          this.globalMessageService.showSuccess({
            message: this.translateService.instant(marker('common.successOperation')),
            actionText: this.translateService.instant(marker('common.close'))
          });
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
}
