import { Component, Input } from '@angular/core';
import { FormArray, FormControl, FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import TemplatesCommonDTO from '@data/models/templates/templates-common-dto';
import TemplatesTimelineDTO, { TemplatesTimelineItemsDTO } from '@data/models/templates/templates-timeline-dto';
import { WorkflowSubstateTimelineItemDTO, WorkflowTimelineDTO } from '@data/models/workflow-admin/workflow-timeline-dto';
import WorkflowStateDTO from '@data/models/workflows/workflow-state-dto';
import WorkflowSubstateDTO from '@data/models/workflows/workflow-substate-dto';
import { TemplatesTimelineService } from '@data/services/templates-timeline.service';
import { WorkflowAdministrationStatesSubstatesService } from '@data/services/workflow-administration-states-substates.service';
import { WorkflowAdministrationService } from '@data/services/workflow-administration.service';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { forkJoin } from 'rxjs';
import { finalize, take } from 'rxjs/operators';
import { WorkflowsCreateEditAuxService } from '../../../aux-service/workflows-create-edit-aux.service';
import { WorkflowStepAbstractClass } from '../workflow-step-abstract-class';
import { WorkflowAttachmentTimelineDTO } from '@data/models/workflow-admin/workflow-attachment-timeline-dto';
import { TemplateAtachmentItemsDTO } from '@data/models/templates/templates-attachment-dto';

@Component({
  selector: 'app-workflow-timeline',
  templateUrl: './workflow-timeline.component.html',
  styleUrls: ['./workflow-timeline.component.scss']
})
export class WorkflowTimelineComponent extends WorkflowStepAbstractClass {
  @Input() workflowId: number;
  @Input() stepIndex: number;
  public labels = {
    title: marker('workflows.selectTimeline'),
    timelineStates: marker('workflows.timelineStates'),
    label: marker('workflows.timelineLabel'),
    required: marker('errors.required'),
    selectAttachmentTab: marker('workflows.selectAttachmentTab'),
    attachmentTab: marker('workflows.attachmentTab'),
    category: marker('workflows.attachemntCategory')
  };
  public templateForm: FormControl;
  public substateList: WorkflowSubstateDTO[] = [];
  public substateDragging: WorkflowSubstateDTO;
  constructor(
    private fb: UntypedFormBuilder,
    public workflowsCreateEditAuxService: WorkflowsCreateEditAuxService,
    public confirmationDialog: ConfirmDialogService,
    public translateService: TranslateService,
    private spinnerService: ProgressSpinnerDialogService,
    public workflowService: WorkflowAdministrationService,
    public workflowStateService: WorkflowAdministrationStatesSubstatesService,
    public timelineService: TemplatesTimelineService,
    private globalMessageService: GlobalMessageService
  ) {
    super(workflowsCreateEditAuxService, confirmationDialog, translateService);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public initForm(data: any): void {
    if (data && data.stateList) {
      data.stateList.forEach((state: WorkflowStateDTO) => {
        state.workflowSubstates.forEach((substate: WorkflowSubstateDTO) => {
          substate.workflowState = { ...state, workflowSubstates: [] };
          this.substateList.push(substate);
        });
      });
    }
    this.templateForm = new FormControl(null);
    if (data && data.workflowTimeline && data.workflowTimeline.templateTimelineDTO) {
      this.templateForm.setValue(
        data.timelineTemplates.find(
          (template: TemplatesCommonDTO) => template.id === data.workflowTimeline.templateTimelineDTO.template.id
        )
      );
    }
    this.form = this.fb.group({
      templateTimelineDTO: [data?.workflowTimeline?.templateTimelineDTO],
      workflowSubstateTimelineItems: this.fb.array([]),
      tabId: [data?.workflowTimeline?.tabId],
      templateAttachmentItemId: [data?.workflowTimeline?.templateAttachmentItemId]
    });
    if (data?.workflowTimeline?.workflowSubstateTimelineItems?.length > 0) {
      data.workflowTimeline.workflowSubstateTimelineItems.forEach((timelineItem: WorkflowSubstateTimelineItemDTO) => {
        (this.form.get('workflowSubstateTimelineItems') as FormArray).push(this.generateTimelineItem(timelineItem));
      });
    }
  }
  public generateTimelineItem(workflowTimelineItem: WorkflowSubstateTimelineItemDTO): FormGroup {
    workflowTimelineItem.workflowSubstate = this.substateList.find(
      (substate: WorkflowSubstateDTO) => substate.id === workflowTimelineItem.workflowSubstate.id
    );
    return this.fb.group({
      templateTimelineItem: [workflowTimelineItem.templateTimelineItem],
      workflowSubstate: [workflowTimelineItem.workflowSubstate, [Validators.required]]
    });
  }
  public generateTimelineItemByTemplate(substate: WorkflowSubstateDTO): FormGroup {
    return this.fb.group({
      templateTimelineItem: [],
      workflowSubstate: [substate]
    });
  }
  public setSubstateDragging(substate: WorkflowSubstateDTO): void {
    this.substateDragging = substate;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public dropSubstate(timeline: TemplatesTimelineItemsDTO): void {
    const timelineLineIndex = this.form
      .get('workflowSubstateTimelineItems')
      .getRawValue()
      .findIndex((timeLine: WorkflowSubstateTimelineItemDTO) => timeLine.workflowSubstate.id === this.substateDragging.id);
    this.form
      .get('workflowSubstateTimelineItems')
      .get(timelineLineIndex.toString())
      .get('templateTimelineItem')
      .setValue(timeline);
    this.form.markAsTouched();
    this.form.markAsDirty();
  }
  public getSubstatesByTimeline(timelineItem?: TemplatesTimelineItemsDTO): WorkflowSubstateDTO[] {
    let timelineLineItems = this.form.get('workflowSubstateTimelineItems').getRawValue() as WorkflowSubstateTimelineItemDTO[];
    if (timelineItem) {
      timelineLineItems = timelineLineItems.filter(
        (timeLine: WorkflowSubstateTimelineItemDTO) =>
          timeLine.templateTimelineItem && timeLine.templateTimelineItem.id === timelineItem.id
      );
      return timelineLineItems.map((timeLine: WorkflowSubstateTimelineItemDTO) => timeLine.workflowSubstate);
    } else {
      timelineLineItems = timelineLineItems.filter((timeLine: WorkflowSubstateTimelineItemDTO) => !timeLine.templateTimelineItem);
      return timelineLineItems.map((timeLine: WorkflowSubstateTimelineItemDTO) => timeLine.workflowSubstate);
    }
  }
  public removeTimeLine(substate: WorkflowSubstateDTO): void {
    const index = this.form
      .get('workflowSubstateTimelineItems')
      .getRawValue()
      .findIndex((timeLine: WorkflowSubstateTimelineItemDTO) => timeLine.workflowSubstate.id === substate.id);
    this.form.get('workflowSubstateTimelineItems').get(index.toString()).get('templateTimelineItem').setValue(null);
    this.form.markAsTouched();
    this.form.markAsDirty();
  }
  public removeAttachmentTab(): void {
    this.form.get('tabId').setValue(null);
    this.form.get('templateAttachmentItemId').setValue(null);
  }
  public getAttachmentItems(): TemplateAtachmentItemsDTO[] {
    if (this.form.get('tabId')?.value) {
      const attachmentTimeline = this.originalData.attachmentTemplates.find(
        (attTime: WorkflowAttachmentTimelineDTO) => attTime.id === this.form.get('tabId')?.value
      );
      return attachmentTimeline?.template?.templateAttachmentItems?.length
        ? attachmentTimeline.template.templateAttachmentItems
        : [];
    } else {
      return [];
    }
  }
  public removeTemplate() {
    this.templateForm.setValue(null);
    this.form.get('templateTimelineDTO').setValue(null);
    const formArray = this.form.get('workflowSubstateTimelineItems') as FormArray;
    while (formArray.length > 0) {
      formArray.removeAt(0);
    }
    this.form.markAsTouched();
    this.form.markAsDirty();
  }
  public changeTemplate() {
    if (this.templateForm.value) {
      const spinner = this.spinnerService.show();
      this.timelineService
        .findById(this.templateForm.value.id)
        .pipe(take(1))
        .subscribe((res: TemplatesTimelineDTO) => {
          this.form.get('templateTimelineDTO').setValue(res);
          const formArray = this.form.get('workflowSubstateTimelineItems') as FormArray;
          while (formArray.length > 0) {
            formArray.removeAt(0);
          }
          this.substateList.forEach((substate: WorkflowSubstateDTO) => {
            (this.form.get('workflowSubstateTimelineItems') as FormArray).push(this.generateTimelineItemByTemplate(substate));
          });
          this.form.markAsTouched();
          this.form.markAsDirty();
          this.spinnerService.hide(spinner);
        });
    }
  }
  public selectAttachmentTab() {
    const tabItems = this.getAttachmentItems();
    this.form.get('templateAttachmentItemId').setValue(tabItems.length ? tabItems[0] : null);
  }
  public async getWorkflowStepData(): Promise<boolean> {
    const spinner = this.spinnerService.show();
    return new Promise((resolve, reject) => {
      const resquests = [
        this.workflowService.getWorkflowTimeline(this.workflowId).pipe(take(1)),
        this.workflowService.getTemplates(this.workflowId, 'TIMELINE').pipe(take(1)),
        this.workflowStateService.getWorkflowStatesAndSubstates(this.workflowId).pipe(take(1)),
        this.workflowService.getWorkflowTimelineAttachments(this.workflowId).pipe(take(1))
      ];
      forkJoin(resquests).subscribe(
        (responses: [WorkflowTimelineDTO, TemplatesCommonDTO[], WorkflowStateDTO[], WorkflowAttachmentTimelineDTO[]]) => {
          this.originalData = {
            workflowTimeline: responses[0],
            timelineTemplates: responses[1] ? responses[1] : [],
            stateList: responses[2],
            attachmentTemplates: responses[3] ? responses[3] : []
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
      const body = this.form.getRawValue() as WorkflowTimelineDTO;
      body.workflowSubstateTimelineItems = body.workflowSubstateTimelineItems
        ? body.workflowSubstateTimelineItems.filter((timelineItem) => timelineItem.templateTimelineItem)
        : [];
      console.log(JSON.stringify(body));
      this.workflowService
        .postWorkflowTimeline(this.workflowId, body)
        .pipe(
          take(1),
          finalize(() => {
            this.spinnerService.hide(spinner);
          })
        )
        .subscribe({
          next: (response) => {
            resolve(true);
          },
          error: (error: ConcenetError) => {
            this.globalMessageService.showError({
              message: error.message,
              actionText: this.translateService.instant(marker('common.close'))
            });
            resolve(false);
          }
        });
    });
  }
}
