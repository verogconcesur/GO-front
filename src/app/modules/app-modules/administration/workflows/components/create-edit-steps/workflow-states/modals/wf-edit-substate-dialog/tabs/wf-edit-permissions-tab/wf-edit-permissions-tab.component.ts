import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import WorkflowSubstateDTO from '@data/models/workflows/workflow-substate-dto';
import { WorkflowAdministrationStatesSubstatesService } from '@data/services/workflow-administration-states-substates.service';
import { TranslateService } from '@ngx-translate/core';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { NGXLogger } from 'ngx-logger';
import { WEditSubstateFormAuxService } from '../../aux-service/wf-edit-substate-aux.service';
import { WfEditSubstateAbstractTabClass } from '../wf-edit-substate-abstract-tab-class';

@Component({
  selector: 'app-wf-edit-permissions-tab',
  templateUrl: './wf-edit-permissions-tab.component.html',
  styleUrls: ['./wf-edit-permissions-tab.component.scss']
})
export class WfEditPermissionsTabComponent extends WfEditSubstateAbstractTabClass implements OnInit {
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

  public initForm(data: WorkflowSubstateDTO): void {
    console.log('Set form with data', data);
    const form = this.fb.group({});
    this.editSubstateAuxService.setFormGroupByTab(form, this.tabId);
    this.editSubstateAuxService.setFormOriginalData(this.form.value, this.tabId);
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
}
