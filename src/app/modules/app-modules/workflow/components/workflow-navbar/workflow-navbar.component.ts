import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { RouteConstants } from '@app/constants/route.constants';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import WorkflowDTO from '@data/models/workflows/workflow-dto';
import WorkflowListByFacilityDTO from '@data/models/workflows/workflow-list-by-facility-dto';
import { WorkflowsService } from '@data/services/workflows.service';
import { TranslateService } from '@ngx-translate/core';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { NGXLogger } from 'ngx-logger';
import { Observable } from 'rxjs';
import { take, startWith, map } from 'rxjs/operators';
import { WorkflowDragAndDropService } from '../../aux-service/workflow-drag-and-drop.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-workflow-navbar',
  templateUrl: './workflow-navbar.component.html',
  styleUrls: ['./workflow-navbar.component.scss']
})
export class WorkflowNavbarComponent implements OnInit, OnDestroy {
  public currentUrl = '';
  public currentView: RouteConstants | string = null;
  public idWorkflowRouteParam: number = null;
  public workflowList: WorkflowListByFacilityDTO[] = [];
  public workflowForm: UntypedFormGroup;
  public workflowGroupOptions: Observable<WorkflowListByFacilityDTO[]>;
  public workflowSelected: WorkflowDTO;
  public labels = {
    selectWorkflow: marker('workflows.select'),
    filterWorkflow: marker('workflows.filter')
  };

  constructor(
    private workflowService: WorkflowsService,
    private spinnerService: ProgressSpinnerDialogService,
    private logger: NGXLogger,
    private formBuilder: UntypedFormBuilder,
    private translateService: TranslateService,
    private dragDropService: WorkflowDragAndDropService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.route?.snapshot?.params?.wId) {
      this.idWorkflowRouteParam = parseInt(this.route.snapshot.params.wId, 10);
    }
    this.currentUrl = window.location.hash.split('#/').join('/');
    this.initForms();
    this.getData();
  }

  ngOnDestroy(): void {
    this.workflowService.workflowSelectedSubject$.next(null);
  }

  public goToView(view: 'boardView' | 'tableView' | 'calendarView'): void {
    let lastRoute: RouteConstants = null;
    switch (view) {
      case 'boardView':
        lastRoute = RouteConstants.WORKFLOWS_BOARD_VIEW;
        break;
      case 'tableView':
        lastRoute = RouteConstants.WORKFLOWS_TABLE_VIEW;
        break;
      default:
        lastRoute = RouteConstants.WORKFLOWS_CALENDAR_VIEW;
    }

    if (this.idWorkflowRouteParam) {
      this.router.navigate([RouteConstants.DASHBOARD, RouteConstants.WORKFLOWS, this.idWorkflowRouteParam, lastRoute]);
    } else {
      this.router.navigate([RouteConstants.DASHBOARD, RouteConstants.WORKFLOWS, lastRoute]);
    }
  }

  public isView(view: 'boardView' | 'tableView' | 'calendarView'): boolean {
    switch (view) {
      case 'boardView':
        view = RouteConstants.WORKFLOWS_BOARD_VIEW;
        break;
      case 'tableView':
        view = RouteConstants.WORKFLOWS_TABLE_VIEW;
        break;
      default:
        view = RouteConstants.WORKFLOWS_CALENDAR_VIEW;
    }
    if (this.currentUrl.indexOf(`/${view}`) > 0) {
      this.currentView = view;
      return true;
    }
    return false;
  }

  public getWorkflowGroupLabel(group: WorkflowListByFacilityDTO): string {
    return this.translateService.instant('workflows.byFacilityGroupLabel', { facility: group.facilityName });
  }

  public getWorkflowLabel(): string {
    const workflow: WorkflowDTO = this.workflowForm.get('workflow').value();
    if (workflow && workflow.name) {
      return `${workflow.name} - ${workflow.facility.facilityName}`;
    } else {
      return '';
    }
  }

  public workflowSelectionChange(event: { value: WorkflowDTO }): void {
    const workflow = event.value;
    if (this.idWorkflowRouteParam) {
      this.currentUrl = this.currentUrl
        .split(`${RouteConstants.WORKFLOWS}/${this.idWorkflowRouteParam}/`)
        .join(`${RouteConstants.WORKFLOWS}/${workflow.id}/`);
    } else {
      this.currentUrl = this.currentUrl.split(`${RouteConstants.WORKFLOWS}/`).join(`${RouteConstants.WORKFLOWS}/${workflow.id}/`);
    }
    this.idWorkflowRouteParam = workflow.id;
    this.workflowSelected = workflow;
    this.workflowService.workflowSelectedSubject$.next(workflow);
    this.dragDropService.resetObservables();
    this.workflowForm.get('workflow').setValue(workflow);
    this.workflowForm.get('workflowSearch').setValue('');

    // this.location.go(this.currentUrl);
    this.router.navigate([RouteConstants.DASHBOARD, RouteConstants.WORKFLOWS, this.idWorkflowRouteParam, this.currentView]);
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
          let workflowSelectedByIdParam: WorkflowDTO = null;
          data?.forEach((workflowGroup: WorkflowListByFacilityDTO) => {
            workflowGroup.workflows.forEach((workFlow: WorkflowDTO) => {
              workFlow.facility = { facilityName: workflowGroup.facilityName, facilityId: workflowGroup.facilityId };
              if (workFlow.id === this.idWorkflowRouteParam) {
                workflowSelectedByIdParam = workFlow;
              }
            });
          });
          this.workflowList = data;
          this.workflowGroupOptions = this.workflowForm.get('workflowSearch')?.valueChanges.pipe(
            startWith(''),
            map((value) => this.filterGroup(value || ''))
          );
          if (workflowSelectedByIdParam) {
            this.workflowForm.get('workflow').setValue(workflowSelectedByIdParam);
            this.workflowForm.get('workflow').markAllAsTouched();
            this.workflowForm.get('workflow').markAsDirty();
            this.workflowSelected = workflowSelectedByIdParam;
            this.workflowService.workflowSelectedSubject$.next(workflowSelectedByIdParam);
            this.dragDropService.resetObservables();
          }
          this.spinnerService.hide(spinner);
        },
        (error) => {
          this.logger.error(error);
          this.spinnerService.hide(spinner);
        }
      );
  }

  private filterGroup(value: string): WorkflowListByFacilityDTO[] {
    if (value) {
      return this.workflowList
        .map((group) => ({ ...group, workflows: this.filter(group.workflows, value) }))
        .filter((group) => group.workflows.length > 0);
    }

    return this.workflowList;
  }

  private filter = (opt: WorkflowDTO[], value: string): WorkflowDTO[] => {
    const filterValue = value.toLowerCase();
    return opt.filter((item: WorkflowDTO) => item.name.toLowerCase().includes(filterValue));
  };
}
