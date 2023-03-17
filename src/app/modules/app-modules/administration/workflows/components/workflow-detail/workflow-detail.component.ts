import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatTab, MatTabChangeEvent, MatTabGroup, MatTabHeader } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import WorkflowDTO from '@data/models/workflows/workflow-dto';
import { WorkflowAdministrationService } from '@data/services/workflow-administration.service';
import { CustomDialogService } from '@jenga/custom-dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { take } from 'rxjs/operators';
import { WorkflowsCreateEditAuxService } from '../../aux-service/workflows-create-edit-aux.service';
// eslint-disable-next-line max-len
import {
  CreateEditWorkflowComponent,
  CreateEditWorkflowComponentModalEnum
} from '../modals/create-edit-workflow/create-edit-workflow.component';

@UntilDestroy()
@Component({
  selector: 'app-workflow-detail',
  templateUrl: './workflow-detail.component.html',
  styleUrls: ['./workflow-detail.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class WorkflowDetailComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('tabGroup') tabs: MatTabGroup;
  public workflowDetail: WorkflowDTO = null;
  public firstLoad = false;
  public tabIndex = 0;
  public labels = {
    newWorkflow: marker('workflows.newWorkflow'),
    organization: marker('administration.organization'),
    roles: marker('roles.roles'),
    users: marker('users.title'),
    cards: marker('administration.records'),
    cardConfig: marker('workflows.cardConfig'),
    states: marker('workflows.states'),
    timeline: marker('administration.templates.clientTimeline.title'),
    budgets: marker('administration.templates.budgets.title'),
    save: marker('common.save'),
    reset: marker('common.reset'),
    next: marker('common.next')
  };
  constructor(
    public workflowsCreateEditAuxService: WorkflowsCreateEditAuxService,
    private route: ActivatedRoute,
    private workflowService: WorkflowAdministrationService,
    private customDialogService: CustomDialogService,
    private translateService: TranslateService,
    private spinnerService: ProgressSpinnerDialogService,
    private confirmDialogService: ConfirmDialogService,
    private globalMessageService: GlobalMessageService
  ) {}

  ngOnInit(): void {
    this.initListeners();
    this.getWorkflowInfo();
  }

  ngOnDestroy(): void {
    this.workflowsCreateEditAuxService.destroy();
  }

  ngAfterViewInit(): void {
    // eslint-disable-next-line no-underscore-dangle
    this.tabs._handleClick = this.myTabChange.bind(this);
  }

  public initListeners(): void {
    this.workflowsCreateEditAuxService.nextStep$.pipe(untilDestroyed(this)).subscribe((goNext: boolean) => {
      if (goNext && this.tabIndex < 7) {
        this.tabIndex++;
      }
    });
  }

  public getWorkflowInfo() {
    this.route.paramMap.subscribe((params) => {
      const idWorkflow = Number(params.get('idWorkflow'));
      if (idWorkflow) {
        const spinner = this.spinnerService.show();
        this.workflowService
          .getWorkflow(idWorkflow)
          .pipe(take(1))
          .subscribe(
            (res) => {
              this.spinnerService.hide(spinner);
              this.workflowDetail = res;
              this.firstLoad = true;
            },
            (error) => {
              this.spinnerService.hide(spinner);
              this.firstLoad = true;
              this.globalMessageService.showError({
                message: error.message,
                actionText: this.translateService.instant(marker('common.close'))
              });
            }
          );
      } else {
        this.firstLoad = true;
        this.createEditWorkflow();
      }
    });
  }

  public getWorkflowName(): string {
    if (this.workflowDetail) {
      return this.workflowDetail.name;
    } else if (this.firstLoad) {
      return this.translateService.instant(this.labels.newWorkflow);
    }
    return '';
  }

  public myTabChange(tab: MatTab, tabHeader: MatTabHeader, idx: number) {
    if (idx >= 1 && !this.workflowsCreateEditAuxService.enableTabStep(idx - 1)) {
      return;
    } else if (this.workflowsCreateEditAuxService.isFormGroupSettedAndNotDirtyOrTouched(this.tabIndex)) {
      this.tabIndex = idx;
    } else {
      this.confirmDialogService
        .open({
          title: this.translateService.instant(marker('common.warning')),
          message: this.translateService.instant(marker('errors.ifContinueLosingChanges'))
        })
        .pipe(take(1))
        .subscribe((ok: boolean) => {
          if (ok) {
            this.resetForm();
            this.tabIndex = idx;
          }
        });
    }
  }

  public saveAndGoNextStep(): void {
    this.workflowsCreateEditAuxService.saveAndGoNextStep(true);
  }

  public resetForm(): void {
    this.workflowsCreateEditAuxService.resetForm();
  }

  public createEditWorkflow(): void {
    this.customDialogService
      .open({
        id: CreateEditWorkflowComponentModalEnum.ID,
        panelClass: CreateEditWorkflowComponentModalEnum.PANEL_CLASS,
        component: CreateEditWorkflowComponent,
        extendedComponentData: this.workflowDetail,
        disableClose: true,
        width: '900px'
      })
      .subscribe((res) => {
        if (res) {
          this.workflowDetail = res;
        }
      });
  }
}
