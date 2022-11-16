import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormGroup, UntypedFormBuilder } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CardColumnTabDTO from '@data/models/cards/card-column-tab-dto';
import CardDTO from '@data/models/cards/card-dto';
import RoleDTO from '@data/models/user-permissions/role-dto';
import WorkflowCardTabDTO from '@data/models/workflow-admin/workflow-card-tab-dto';
import WorkflowCardTabPermissionsDTO, {
  WorkFlowCardPermissionsEnum
} from '@data/models/workflow-admin/workflow-card-tab-permissions-dto';
import { CardService } from '@data/services/cards.service';
import { WorkflowAdministrationService } from '@data/services/workflow-administration.service';
import { ComponentToExtendForCustomDialog, CustomDialogService, CustomDialogFooterConfigI } from '@jenga/custom-dialog';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { NGXLogger } from 'ngx-logger';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, finalize, map, take } from 'rxjs/operators';

export const enum WorkflowCardsPermissionsComponentModalEnum {
  ID = 'workflow-cards-permissions-dialog-id',
  PANEL_CLASS = 'workflow-cards-permissions-dialog',
  TITLE = 'workflows.editPermissions'
}

@Component({
  selector: 'app-workflow-cards-permissions',
  templateUrl: './workflow-cards-permissions.component.html',
  styleUrls: ['./workflow-cards-permissions.component.scss']
})
export class WorkflowCardsPermissionsComponent extends ComponentToExtendForCustomDialog implements OnInit, OnDestroy {
  public labels = {
    title: marker('workflows.editPermissions'),
    subtitle: marker('workflows.card.permissionTitle'),
    text: marker('workflows.card.permissionSubtitle'),
    cardDetal: marker('workflows.card.cardTabs'),
    whoSees: marker('common.whoSees'),
    hide: marker('common.HIDE'),
    show: marker('common.SHOW'),
    edit: marker('common.EDIT')
  };
  public permissionForm: FormArray;
  public tabForm: FormGroup;
  public workflowId: number;
  public cardId: number;
  public originalPermissions: WorkflowCardTabDTO[];
  public cardData: CardDTO;
  public roles: RoleDTO[];
  public selectedTab: CardColumnTabDTO;
  public permissionEnum: WorkFlowCardPermissionsEnum;
  constructor(
    private fb: UntypedFormBuilder,
    private spinnerService: ProgressSpinnerDialogService,
    private confirmDialogService: ConfirmDialogService,
    private translateService: TranslateService,
    private globalMessageService: GlobalMessageService,
    public workflowService: WorkflowAdministrationService,
    public cardService: CardService,
    private logger: NGXLogger
  ) {
    super(
      WorkflowCardsPermissionsComponentModalEnum.ID,
      WorkflowCardsPermissionsComponentModalEnum.PANEL_CLASS,
      WorkflowCardsPermissionsComponentModalEnum.TITLE
    );
  }
  ngOnInit(): void {
    this.workflowId = this.extendedComponentData.workflowId;
    this.cardId = this.extendedComponentData.cardId;
    forkJoin([
      this.workflowService.getWorkflowCardPermissions(this.workflowId).pipe(take(1)),
      this.cardService.getCardById(this.cardId).pipe(take(1)),
      this.workflowService.getWorkflowUserRoles(this.workflowId).pipe(take(1))
    ]).subscribe((res) => {
      this.originalPermissions = res[0];
      this.cardData = res[1];
      this.roles = res[2];
      this.initializeForm();
    });
  }

  ngOnDestroy(): void {}

  public confirmCloseCustomDialog(): Observable<boolean> {
    if (this.permissionForm.touched && this.permissionForm.dirty) {
      return this.confirmDialogService.open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('common.unsavedChangesExit'))
      });
    } else {
      return of(true);
    }
  }

  public onSubmitCustomDialog(): Observable<boolean | WorkflowCardTabDTO[]> {
    const formValue = this.permissionForm.value;
    const spinner = this.spinnerService.show();
    return this.workflowService.postWorkflowCardPermissions(this.workflowId, formValue).pipe(
      take(1),
      map((response) => {
        this.globalMessageService.showSuccess({
          message: this.translateService.instant(marker('common.successOperation')),
          actionText: this.translateService.instant(marker('common.close'))
        });
        return response;
      }),
      catchError((error) => {
        this.globalMessageService.showError({
          message: error.message,
          actionText: this.translateService.instant(marker('common.close'))
        });
        return of(false);
      }),
      finalize(() => {
        this.spinnerService.hide(spinner);
      })
    );
  }

  public setAndGetFooterConfig(): CustomDialogFooterConfigI | null {
    return {
      show: true,
      leftSideButtons: [
        {
          type: 'custom',
          label: marker('common.cancel'),
          design: 'stroked',
          color: 'warn',
          clickFn: this.confirmCloseCustomDialog
        }
      ],
      rightSideButtons: [
        {
          type: 'submit',
          label: marker('common.save'),
          design: 'raised',
          color: 'primary',
          clickFn: this.onSubmitCustomDialog,
          disabledFn: () => !(this.permissionForm.touched && this.permissionForm.dirty && this.permissionForm.valid)
        }
      ]
    };
  }

  private initializeForm = (): void => {
    this.permissionForm = this.fb.array([]);
    this.originalPermissions.forEach((permission: WorkflowCardTabDTO) => {
      this.permissionForm.push(this.generateFormPermission(permission));
    });
  };
  private generateFormPermission(cardPermission: WorkflowCardTabDTO): FormGroup {
    const form = this.fb.group({
      id: [cardPermission.id],
      tabId: [cardPermission.tabId],
      workflowId: [cardPermission.workflowId],
      workflowCardTabPermissions: this.fb.array([])
    });
    if (cardPermission && cardPermission.workflowCardTabPermissions && cardPermission.workflowCardTabPermissions.length) {
      cardPermission.workflowCardTabPermissions.forEach((permission: WorkflowCardTabPermissionsDTO) => {
        (form.get('workflowCardTabPermissions') as FormArray).push(this.generateTabPermission(permission));
      });
      return form;
    }
  }
  private generateTabPermission(cardTabPermission: WorkflowCardTabPermissionsDTO): FormGroup {
    return this.fb.group({
      id: [cardTabPermission.id],
      permissionType: [cardTabPermission.permissionType],
      role: [cardTabPermission.role],
      workflowCardTabId: [cardTabPermission.workflowCardTabId]
    });
  }
}
