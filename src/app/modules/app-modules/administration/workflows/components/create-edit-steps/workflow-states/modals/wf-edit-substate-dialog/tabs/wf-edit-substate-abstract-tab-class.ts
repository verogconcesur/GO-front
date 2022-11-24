/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Directive, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import WorkflowStateDTO from '@data/models/workflows/workflow-state-dto';
import WorkflowSubstateDTO from '@data/models/workflows/workflow-substate-dto';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { Observable } from 'rxjs';
import { finalize, take } from 'rxjs/operators';
import { TAB_IDS, WEditSubstateFormAuxService } from '../aux-service/wf-edit-substate-aux.service';

/**
 * @abstract @class WfEditSubstateAbstractClass
 */
@UntilDestroy()
@Directive()
export abstract class WfEditSubstateAbstractTabClass implements OnInit {
  @Input() state: WorkflowStateDTO = null;
  @Input() substate: WorkflowSubstateDTO = null;
  @Input() workflowId: number = null;
  @Input() dataToInitForm: any = null;
  @Input() tabId: TAB_IDS;
  @Output() substateChanged: EventEmitter<WorkflowSubstateDTO> = new EventEmitter();

  constructor(public editSubstateAuxService: WEditSubstateFormAuxService, public spinnerService: ProgressSpinnerDialogService) {}

  get form(): UntypedFormGroup {
    return this.editSubstateAuxService.getFormGroupByTab(this.tabId);
  }

  ngOnInit(): void {
    this.initListeners();
    if (this.dataToInitForm) {
      this.initForm(this.dataToInitForm);
    } else {
      const spinner = this.spinnerService.show();
      this.getData()
        .pipe(
          take(1),
          finalize(() => this.spinnerService.hide(spinner))
        )
        .subscribe((data) => {
          this.dataToInitForm = data;
          this.initForm(this.dataToInitForm);
        });
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

  public abstract initForm(data?: any): void;

  public abstract saveData(): void;

  public abstract getData(): Observable<any>;
}
