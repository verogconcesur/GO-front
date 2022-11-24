import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormArray, UntypedFormGroup, Validators } from '@angular/forms';
import WorkflowMoveDTO from '@data/models/workflows/workflow-move-dto';
import WorkflowSubstateDTO from '@data/models/workflows/workflow-substate-dto';
import { WorkflowAdministrationStatesSubstatesService } from '@data/services/workflow-administration-states-substates.service';
import { TranslateService } from '@ngx-translate/core';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { NGXLogger } from 'ngx-logger';
import { Observable, of } from 'rxjs';
import { take } from 'rxjs/operators';
import { WEditSubstateFormAuxService } from '../../aux-service/wf-edit-substate-aux.service';
import { WfEditSubstateAbstractTabClass } from '../wf-edit-substate-abstract-tab-class';

@Component({
  selector: 'app-wf-edit-substate-movements-tab',
  templateUrl: './wf-edit-substate-movements-tab.component.html',
  styleUrls: ['./wf-edit-substate-movements-tab.component.scss']
})
export class WfEditSubstateMovementsTabComponent extends WfEditSubstateAbstractTabClass implements OnInit {
  public labels = {};

  constructor(
    private fb: FormBuilder,
    public editSubstateAuxService: WEditSubstateFormAuxService,
    private substatesService: WorkflowAdministrationStatesSubstatesService,
    private spinnerService: ProgressSpinnerDialogService,
    private logger: NGXLogger,
    private translateService: TranslateService,
    private globalMessageService: GlobalMessageService
  ) {
    super(editSubstateAuxService);
  }

  public initForm(movements: WorkflowMoveDTO[]): void {
    console.log('Set form with data', movements);
    const fa: UntypedFormArray = this.fb.array([]);
    movements?.forEach((move: WorkflowMoveDTO) =>
      fa.push(
        this.fb.group({
          id: [move?.id ? move.id : null, [Validators.required]],
          orderNumber: [move?.orderNumber ? move.orderNumber : 0, [Validators.required]],
          requiredFields: [move?.requiredFields ? move.requiredFields : false],
          requiredFieldsList: [move?.requiredFieldsList ? move.requiredFieldsList : []],
          requiredHistoryComment: [move?.requiredHistoryComment ? move.requiredHistoryComment : false],
          requiredMyself: [move?.requiredMyself ? move.requiredMyself : false],
          requiredSize: [move?.requiredSize ? move.requiredSize : false],
          requiredUser: [move?.requiredUser ? move.requiredUser : false],
          roles: [move?.roles ? move.roles : []],
          sendMail: [move?.sendMail ? move.sendMail : false],
          sendMailAuto: [move?.sendMailAuto ? move.sendMailAuto : false],
          sendMailReceiverRole: [move?.sendMailReceiverRole ? move.sendMailReceiverRole : null],
          sendMailReceiverType: [move?.sendMailReceiverType ? move.sendMailReceiverType : null],
          shortcut: [move?.shortcut ? move.shortcut : false],
          shortcutColor: [move?.shortcutColor ? move.shortcutColor : null],
          shortcutName: [move?.shortcutName ? move.shortcutName : null],
          signDocument: [move?.signDocument ? move.signDocument : false],
          workflowSubstateSource: [move?.workflowSubstateSource ? move.workflowSubstateSource : null],
          workflowSubstateTarget: [move?.workflowSubstateTarget ? move.workflowSubstateTarget : null],
          workflowSubstateTargetExtra: [move?.workflowSubstateTargetExtra ? move.workflowSubstateTargetExtra : null],
          movementExtraAuto: [move?.movementExtraAuto ? move.movementExtraAuto : false],
          movementExtraConfirm: [move?.movementExtraConfirm ? move.movementExtraConfirm : false],
          requiredMovementExtra: [move?.requiredMovementExtra ? move.requiredMovementExtra : false]
        })
      )
    );
    const form = this.fb.group({
      movements: fa
    });
    this.editSubstateAuxService.setFormGroupByTab(form, this.tabId);
    this.editSubstateAuxService.setFormOriginalData(this.form.value, this.tabId);
    console.log(this.form, this.form.value);
  }

  public saveData(): void {
    // const spinner = this.spinnerService.show();
    // this.substatesService
    //   .createWorkflowSubstate(this.workflowId, this.state.id, { ...this.substate, ...this.form.value })
    //   .pipe(
    //     take(1),
    //     finalize(() => this.spinnerService.hide(spinner))
    //   )
    //   .subscribe({
    //     next: (response: WorkflowSubstateDTO) => {
    //       this.substateChanged.emit(response);
    //       this.initForm(response);
    //       this.editSubstateAuxService.setFormOriginalData(this.form.value, this.tabId);
    //       this.globalMessageService.showSuccess({
    //         message: this.translateService.instant(marker('common.successOperation')),
    //         actionText: this.translateService.instant(marker('common.close'))
    //       });
    //     },
    //     error: (error: ConcenetError) => {
    //       this.logger.error(error);
    //       this.globalMessageService.showError({
    //         message: error.message,
    //         actionText: this.translateService.instant(marker('common.close'))
    //       });
    //     }
    //   });
  }

  public getData(): Observable<WorkflowMoveDTO[]> {
    return this.substatesService.getWorkflowSubstateMovements(this.workflowId, this.substate.id).pipe(take(1));
  }
}
