import { Component, Input } from '@angular/core';
import { FormArray, FormControl, FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import TemplatesCommonDTO from '@data/models/templates/templates-common-dto';
import { TemplatesTimelineItemsDTO } from '@data/models/templates/templates-timeline-dto';
import { WorkflowSubstateTimelineItemDTO, WorkflowTimelineDTO } from '@data/models/workflow-admin/workflow-timeline-dto';
import WorkflowStateDTO from '@data/models/workflows/workflow-state-dto';
import WorkflowSubstateDTO from '@data/models/workflows/workflow-substate-dto';
import { WorkflowAdministrationService } from '@data/services/workflow-administration.service';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { NGXLogger } from 'ngx-logger';
import { forkJoin } from 'rxjs';
import { finalize, take } from 'rxjs/operators';
import { WorkflowsCreateEditAuxService } from '../../../aux-service/workflows-create-edit-aux.service';
import { WorkflowStepAbstractClass } from '../workflow-step-abstract-class';

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
    label: marker('workflows.timeline')
  };
  public templateForm: FormControl;
  public substateList: WorkflowSubstateDTO[] = [];
  constructor(
    private fb: UntypedFormBuilder,
    public workflowsCreateEditAuxService: WorkflowsCreateEditAuxService,
    public confirmationDialog: ConfirmDialogService,
    public translateService: TranslateService,
    private spinnerService: ProgressSpinnerDialogService,
    public workflowService: WorkflowAdministrationService,
    private logger: NGXLogger
  ) {
    super(workflowsCreateEditAuxService, confirmationDialog, translateService);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public initForm(data: any): void {
    this.originalData.stateList.forEach((state: WorkflowStateDTO) => {
      this.substateList = [...this.substateList, ...state.workflowSubstates];
    });
    this.templateForm = new FormControl(null, [Validators.required]);
    if (data.workflowTimeline) {
      this.templateForm.setValue(
        this.originalData.find((template: TemplatesCommonDTO) => template.id === data.workflowTimeline.templateTimelineDTO.id)
      );
    }
    this.form = this.fb.group({
      templateTimelineDTO: [data?.workflowTimeline?.templateTimelineDTO, [Validators.required]],
      workflowSubstateTimelineItems: this.fb.array([])
    });
    if (data?.workflowTimeline?.workflowSubstateTimelineItems?.length > 0) {
      data.workflowTimeline.workflowSubstateTimelineItems.forEach((timelineItem: WorkflowSubstateTimelineItemDTO) => {
        (this.form.get('workflowSubstateTimelineItems') as FormArray).push(this.generateTimelineItem(timelineItem));
      });
    }
  }
  public generateTimelineItem(timelineItem: WorkflowSubstateTimelineItemDTO): FormGroup {
    return this.fb.group({
      templateTimelineItem: [timelineItem.templateTimelineItem, [Validators.required]],
      workflowSubstateTimelineItems: [timelineItem.workflowSubstate ? timelineItem.workflowSubstate : []]
    });
  }
  public async getWorkflowStepData(): Promise<boolean> {
    const spinner = this.spinnerService.show();
    return new Promise((resolve, reject) => {
      const states = this.workflowsCreateEditAuxService.getFormGroupByStep(5).getRawValue() as WorkflowStateDTO[];
      const resquests = [
        this.workflowService.getWorkflowTimeline(this.workflowId).pipe(take(1)),
        this.workflowService.getTemplates(this.workflowId, 'TIMELINE').pipe(take(1)),
        // this.workflowService.getWorkflowStates(this.workflowId).pipe(take(1))
      ];
      forkJoin(resquests).subscribe(
        (responses: [WorkflowTimelineDTO, TemplatesCommonDTO[], WorkflowStateDTO]) => {
          this.originalData = {
            workflowTimeline: responses[0],
            timelineTemplates: responses[1],
            stateList: responses[2]
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
      const timelineBody = this.form.getRawValue();
      this.workflowService
        .postWorkflowTimeline(this.workflowId, timelineBody)
        .pipe(
          take(1),
          finalize(() => {
            this.spinnerService.hide(spinner);
          })
        )
        .subscribe({
          next: (response) => {
            this.initForm(timelineBody);
            resolve(true);
          },
          error: (err) => {
            this.logger.error(err);
            resolve(false);
          }
        });
    });
  }
}
