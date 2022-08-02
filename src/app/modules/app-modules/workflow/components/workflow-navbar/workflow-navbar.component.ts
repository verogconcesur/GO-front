import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { RouteConstants } from '@app/constants/route.constants';
import WorkflowDto from '@data/models/workflow-dto';
import WorkflowListByFacilityDto from '@data/models/workflow-list-by-facility-dto';
import { WorkflowsService } from '@data/services/workflows.service';
import { TranslateService } from '@ngx-translate/core';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { NGXLogger } from 'ngx-logger';
import { Observable } from 'rxjs';
import { take, startWith, map } from 'rxjs/operators';

@Component({
  selector: 'app-workflow-navbar',
  templateUrl: './workflow-navbar.component.html',
  styleUrls: ['./workflow-navbar.component.scss']
})
export class WorkflowNavbarComponent implements OnInit {
  public readonly WORKFLOW_TABLE_PATH = RouteConstants.WORKFLOWS_TABLE_VIEW;
  public readonly WORKFLOW_BOARD_PATH = RouteConstants.WORKFLOWS_BOARD_VIEW;
  public readonly WORKFLOW_CALENDAR_PATH = RouteConstants.WORKFLOWS_CALENDAR_VIEW;
  public workflowList: WorkflowListByFacilityDto[] = [];
  public workflowForm: FormGroup;
  public workflowGroupOptions: Observable<WorkflowListByFacilityDto[]>;
  public workflowSelected: WorkflowDto;

  constructor(
    private workflowService: WorkflowsService,
    private spinnerService: ProgressSpinnerDialogService,
    private logger: NGXLogger,
    private formBuilder: FormBuilder,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.getData();
  }

  public getWorkflowGroupLabel(group: WorkflowListByFacilityDto): string {
    return this.translateService.instant('workflows.byFacilityGroupLabel', { facility: group.facilityName });
  }

  public getWorkflowLabel(): string {
    const workflow: WorkflowDto = this.workflowForm.get('workflow').value();
    if (workflow && workflow.name) {
      return `${workflow.name} - ${workflow.facility.facilityName}`;
    } else {
      return '';
    }
  }

  public workflowSelectionChange(event: { value: WorkflowDto }): void {
    const workflow = event.value;
    this.workflowSelected = workflow;
    this.workflowForm.get('workflow').setValue(workflow);
    this.workflowForm.get('workflowSearch').setValue('');
  }

  private initForms(): void {
    this.workflowForm = this.formBuilder.group({
      workflow: [null],
      workflowSearch: ['']
    });
  }

  private getData(): void {
    const spinner = this.spinnerService.show();
    this.workflowService
      .getWorkflowsList()
      .pipe(take(1))
      .subscribe(
        (data) => {
          data.forEach((workflowGroup: WorkflowListByFacilityDto) => {
            workflowGroup.workflows.forEach(
              (workFlow: WorkflowDto) =>
                (workFlow.facility = { facilityName: workflowGroup.facilityName, facilityId: workflowGroup.facilityId })
            );
          });
          this.workflowList = data;
          this.workflowGroupOptions = this.workflowForm.get('workflowSearch')?.valueChanges.pipe(
            startWith(''),
            map((value) => this.filterGroup(value || ''))
          );
          this.spinnerService.hide(spinner);
        },
        (error) => {
          this.logger.error(error);
          this.spinnerService.hide(spinner);
        }
      );
  }

  private filterGroup(value: string): WorkflowListByFacilityDto[] {
    if (value) {
      return this.workflowList
        .map((group) => ({ ...group, workflows: this.filter(group.workflows, value) }))
        .filter((group) => group.workflows.length > 0);
    }

    return this.workflowList;
  }

  private filter = (opt: WorkflowDto[], value: string): WorkflowDto[] => {
    const filterValue = value.toLowerCase();
    return opt.filter((item: WorkflowDto) => item.name.toLowerCase().includes(filterValue));
  };
}
