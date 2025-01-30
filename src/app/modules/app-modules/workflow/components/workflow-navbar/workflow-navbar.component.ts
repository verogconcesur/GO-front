import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, ChildActivationEnd, NavigationEnd, Router } from '@angular/router';
import { ENV } from '@app/constants/global.constants';
import { ModulesConstants } from '@app/constants/modules.constants';
import { RouteConstants } from '@app/constants/route.constants';
import { AuthenticationService } from '@app/security/authentication.service';
import { RxStompService } from '@app/services/rx-stomp.service';
import { Env } from '@app/types/env';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import FacilityDTO from '@data/models/organization/facility-dto';
import WorkflowDTO from '@data/models/workflows/workflow-dto';
import WorkflowListByFacilityDTO from '@data/models/workflows/workflow-list-by-facility-dto';
import WorkflowSocketMoveDTO from '@data/models/workflows/workflow-socket-move-dto';
import { WorkflowsService } from '@data/services/workflows.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { IMessage } from '@stomp/stompjs';
import { NGXLogger } from 'ngx-logger';
import { Observable, Subscription } from 'rxjs';
import { finalize, map, startWith, take } from 'rxjs/operators';
import { WorkflowDragAndDropService } from '../../aux-service/workflow-drag-and-drop.service';
import { WorkflowPrepareAndMoveService } from '../../aux-service/workflow-prepare-and-move-aux.service';

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
  public workflowList: WorkflowDTO[] = null;
  public workflowForm: UntypedFormGroup;
  // public workflowGroupOptions: Observable<WorkflowListByFacilityDTO[]>;
  public workflowOptions: Observable<WorkflowDTO[]>;
  public workflowSelected: WorkflowDTO;
  public facilitiesOptions: Observable<FacilityDTO[]>;
  public workflowFacilities: FacilityDTO[] = [];
  public facilitiesSelected: FacilityDTO[];
  public websocketSubscription: Subscription[] = [];
  public synchronizingData = false;
  public labels = {
    syncData: marker('workflows.syncData'),
    selectWorkflow: marker('workflows.select'),
    filterWorkflow: marker('workflows.filter'),
    noWorkflows: marker('workflows.noWorkflows'),
    filterFacility: marker('workflows.filterFacilities')
  };

  constructor(
    @Inject(ENV) private env: Env,
    private workflowService: WorkflowsService,
    private spinnerService: ProgressSpinnerDialogService,
    private logger: NGXLogger,
    private formBuilder: UntypedFormBuilder,
    private translateService: TranslateService,
    private dragDropService: WorkflowDragAndDropService,
    private route: ActivatedRoute,
    private prepareAndMoveService: WorkflowPrepareAndMoveService,
    private router: Router,
    private confirmationDialog: ConfirmDialogService,
    private rxStompService: RxStompService,
    private globalMessageService: GlobalMessageService,
    private authService: AuthenticationService
  ) {}

  ngOnInit(): void {
    if (this.route?.snapshot?.params?.wId) {
      this.idWorkflowRouteParam = parseInt(this.route.snapshot.params.wId, 10);
    }
    this.currentUrl = window.location.hash.split('#/').join('/');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.router.events.pipe(untilDestroyed(this)).subscribe((event: any) => {
      if (event instanceof NavigationEnd || event instanceof ChildActivationEnd) {
        if (this.router.url.indexOf('(card:wcId') === -1 && this.workflowList?.length === 1 && !this.idWorkflowRouteParam) {
          this.workflowSelectionChange({ value: this.workflowList[0] });
        }
      }
    });
    this.initForms();
    this.getData();
  }

  ngOnDestroy(): void {
    this.workflowService.workflowSelectedSubject$.next(null);
    this.workflowService.facilitiesSelectedSubject$.next([]);
    if (this.websocketSubscription.length > 0) {
      for (const socketSub of this.websocketSubscription) {
        socketSub.unsubscribe();
      }
    }
  }

  websocketImplementation(): void {
    if (this.env.socketsEnabled) {
      if (this.websocketSubscription.length > 0) {
        for (const socketSub of this.websocketSubscription) {
          socketSub.unsubscribe();
        }
      }
      this.websocketSubscription = [];
      if (this.workflowSelected && this.facilitiesSelected && this.facilitiesSelected.length > 0) {
        for (const facility of this.facilitiesSelected) {
          this.websocketSubscription.push(
            this.rxStompService
              .watch('/topic/movement/' + this.workflowSelected.id + '/' + facility.id)
              .pipe(untilDestroyed(this))
              .subscribe((data: IMessage) => {
                this.prepareAndMoveService.moveCard$.next(JSON.parse(data.body) as WorkflowSocketMoveDTO);
              })
          );
        }
      } else if (this.workflowSelected) {
        for (const facility of this.workflowSelected.facilities) {
          this.websocketSubscription.push(
            this.rxStompService
              .watch('/topic/movement/' + this.workflowSelected.id + '/' + facility.id)
              .pipe(untilDestroyed(this))
              .subscribe((data: IMessage) => {
                this.prepareAndMoveService.moveCard$.next(JSON.parse(data.body) as WorkflowSocketMoveDTO);
              })
          );
        }
      }
    }
  }

  public isContractedModule(option: string): boolean {
    const configList = this.authService.getConfigList();
    if (option === 'listView') {
      return configList.includes(ModulesConstants.LIST_VIEW);
    } else if (option === 'calendarView') {
      return configList.includes(ModulesConstants.CALENDAR_VIEW);
    }
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
      if (view !== this.currentView) {
        this.workflowService.workflowSelectedView$.next(view);
      }
      this.currentView = view;
      return true;
    }
    return false;
  }

  public getWorkflowGroupLabel(group: WorkflowListByFacilityDTO): string {
    return this.translateService.instant('workflows.byFacilityGroupLabel', { facility: group.facilityName });
  }

  public getFacilitiesPlaceholder(): string {
    return `${this.workflowFacilities?.length} ${this.translateService.instant('organizations.facilities.title').toLowerCase()}`;
  }

  public getFacilitiesLabel(): string {
    if (this.facilitiesSelected?.length > 1) {
      return `${this.facilitiesSelected?.length} ${this.translateService
        .instant('organizations.facilities.title')
        .toLowerCase()}`;
    } else if (this.facilitiesSelected?.length === 1) {
      return this.facilitiesSelected[0].name;
    } else {
      return this.getFacilitiesPlaceholder();
    }
  }

  public getWorkflowLabel(w?: WorkflowDTO, mainLabel?: boolean): string {
    const workflow: WorkflowDTO = w ? w : this.workflowForm.get('workflow').value();
    if (workflow && workflow.name) {
      if (workflow.facilities?.length === 1) {
        return `${workflow.name} - ${workflow.facilities[0].name}`;
      } else if (workflow.facilities?.length > 1 && !mainLabel) {
        return `${workflow.name} - ${workflow.facilities?.length} ${this.translateService
          .instant('organizations.facilities.title')
          .toLowerCase()}`;
      } else {
        return `${workflow.name}`;
      }
    } else {
      return '';
    }
  }

  public hasMoreThanOneFacility = (): boolean => this.workflowFacilities?.length > 1;

  public facilitySelectionChange(event: { value: FacilityDTO[] }): void {
    const facilities = event.value;
    this.facilitiesSelected = facilities;
    this.workflowService.facilitiesSelectedSubject$.next(this.facilitiesSelected);
    this.websocketImplementation();
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
    this.facilitiesSelected = [];
    this.workflowForm.get('facility').setValue([]);
    this.workflowService.facilitiesSelectedSubject$.next([]);
    this.dragDropService.resetObservables();
    this.workflowForm.get('workflow').setValue(workflow);
    this.workflowForm.get('workflowSearch').setValue('');
    if (workflow.facilities?.length) {
      this.workflowFacilities = workflow.facilities;
    } else {
      this.workflowFacilities = [];
    }
    this.router.navigate([RouteConstants.DASHBOARD, RouteConstants.WORKFLOWS, this.idWorkflowRouteParam, this.currentView]);
    this.websocketImplementation();
  }

  public syncData(): void {
    this.confirmationDialog
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(this.labels.syncData)
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          this.synchronizingData = true;
          this.workflowService
            .syncData(this.workflowSelected.id)
            .pipe(
              take(1),
              finalize(() => (this.synchronizingData = false))
            )
            .subscribe(
              (data) => {
                this.prepareAndMoveService.reloadData$.next('MOVES_IN_THIS_WORKFLOW');
              },
              (error) => {
                this.globalMessageService.showError({
                  message: error.message,
                  actionText: this.translateService.instant(marker('common.close'))
                });
              }
            );
        }
      });
  }

  private initForms(): void {
    this.workflowForm = this.formBuilder.group({
      workflow: [null],
      workflowSearch: [''],
      facility: [[]],
      facilitySearch: ['']
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
          data?.forEach((workflow: WorkflowDTO) => {
            if (workflow.id === this.idWorkflowRouteParam) {
              workflowSelectedByIdParam = workflow;
            }
          });
          this.workflowList = data ? data : [];
          this.workflowOptions = this.workflowForm.get('workflowSearch')?.valueChanges.pipe(
            startWith(''),
            map((value) => this.filterWorkflow(value || ''))
          );
          this.facilitiesOptions = this.workflowForm.get('facilitySearch')?.valueChanges.pipe(
            startWith(''),
            map((value) => this.filterFacility(value || ''))
          );
          if (workflowSelectedByIdParam) {
            this.workflowForm.get('workflow').setValue(workflowSelectedByIdParam);
            this.workflowForm.get('workflow').markAllAsTouched();
            this.workflowForm.get('workflow').markAsDirty();
            this.workflowSelected = workflowSelectedByIdParam;
            this.workflowService.workflowSelectedSubject$.next(workflowSelectedByIdParam);
            this.facilitiesSelected = [];
            this.workflowForm.get('facility').setValue([]);
            this.workflowService.facilitiesSelectedSubject$.next([]);
            this.dragDropService.resetObservables();
            if (workflowSelectedByIdParam.facilities?.length) {
              this.workflowFacilities = workflowSelectedByIdParam.facilities;
            } else {
              this.workflowFacilities = [];
            }
            this.websocketImplementation();
          }
          this.spinnerService.hide(spinner);
          if (this.workflowList?.length === 1 && !workflowSelectedByIdParam && this.router.url.indexOf('(card:wcId') === -1) {
            this.workflowSelectionChange({ value: this.workflowList[0] });
          }
        },
        (error) => {
          this.logger.error(error);
          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
          this.spinnerService.hide(spinner);
        }
      );
  }

  private filterWorkflow(value: string): WorkflowDTO[] {
    if (value) {
      const filterValue = value.toLowerCase();
      return this.workflowList.filter((item: WorkflowDTO) => item.name.toLowerCase().includes(filterValue));
    }
    return this.workflowList;
  }

  private filterFacility(value: string): FacilityDTO[] {
    if (value) {
      const filterValue = value.toLowerCase();
      return this.workflowFacilities.filter((item: FacilityDTO) => item.name.toLowerCase().includes(filterValue));
    }
    return this.workflowFacilities;
  }
}
