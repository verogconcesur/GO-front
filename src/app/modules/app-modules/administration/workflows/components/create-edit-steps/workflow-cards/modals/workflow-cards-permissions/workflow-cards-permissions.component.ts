import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, UntypedFormBuilder } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CardColumnTabDTO from '@data/models/cards/card-column-tab-dto';
import CardDTO from '@data/models/cards/card-dto';
import RoleDTO from '@data/models/user-permissions/role-dto';
import WorkflowCardTabDTO from '@data/models/workflow-admin/workflow-card-tab-dto';
import WorkflowCardTabPermissionsDTO, {
  WorkFlowPermissionsEnum
} from '@data/models/workflow-admin/workflow-card-tab-permissions-dto';
import { CardService } from '@data/services/cards.service';
import { WorkflowAdministrationService } from '@data/services/workflow-administration.service';
import { ComponentToExtendForCustomDialog, CustomDialogService, CustomDialogFooterConfigI } from '@jenga/custom-dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
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
@UntilDestroy()
@Component({
  selector: 'app-workflow-cards-permissions',
  templateUrl: './workflow-cards-permissions.component.html',
  styleUrls: ['./workflow-cards-permissions.component.scss']
})
export class WorkflowCardsPermissionsComponent extends ComponentToExtendForCustomDialog implements OnInit {
  public labels = {
    title: marker('workflows.editPermissions'),
    subtitle: marker('workflows.card.permissionTitle'),
    text: marker('workflows.card.permissionSubtitle'),
    cardDetal: marker('workflows.card.cardTabs'),
    all: marker('common.all'),
    whoSees: marker('common.whoSees'),
    hide: marker('common.HIDE'),
    show: marker('common.SHOW'),
    edit: marker('common.EDIT')
  };
  public permissionForm: FormArray;
  public cardTabForm: FormGroup;
  public workflowId: number;
  public cardId: number;
  public originalPermissions: WorkflowCardTabDTO[];
  public cardData: CardDTO;
  public roles: RoleDTO[];
  public selectedTab: CardColumnTabDTO;
  public allPermisionForm: FormGroup;
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
  get workflowCardPermissions(): FormArray {
    return this.cardTabForm.get('workflowCardTabPermissions') as FormArray;
  }
  ngOnInit(): void {
    const spinner = this.spinnerService.show();
    this.workflowId = this.extendedComponentData.workflowId;
    this.cardId = this.extendedComponentData.cardId;
    forkJoin([
      this.workflowService.getWorkflowCardPermissions(this.workflowId).pipe(take(1)),
      this.cardService.getCardById(this.cardId).pipe(take(1)),
      this.workflowService.getWorkflowUserRoles(this.workflowId).pipe(take(1))
    ]).subscribe((res) => {
      this.originalPermissions = res[0];
      this.cardData = res[1];
      this.cardData.cols = [...this.cardData.cols.slice(0, 2), this.cardData.cols[3]];
      this.roles = res[2];
      this.initializeForm();
      this.spinnerService.hide(spinner);
    });
  }
  public selectAllTabs(): void {
    this.permissionForm.markAsTouched();
    if (this.allTabSelectedbWithPermissions()) {
      while (this.permissionForm.value && this.permissionForm.value.length) {
        this.permissionForm.removeAt(0);
      }
      this.cardTabForm = null;
      this.selectedTab = null;
    } else {
      this.cardData.cols.forEach((col) => {
        col.tabs.forEach((tab) => {
          if (!this.isTabSelected(tab)) {
            this.addRemoveTabFromPermissions(tab);
          }
        });
      });
    }
  }
  public allTabSelectedbWithPermissions(): boolean {
    return (
      this.cardData &&
      this.cardData.cols[0].tabs.every((tabItem) => this.isTabSelected(tabItem)) &&
      this.cardData.cols[1].tabs.every((tabItem) => this.isTabSelected(tabItem))
    );
  }

  public someTabSelectedbWithPermissions(): boolean {
    return !this.allTabSelectedbWithPermissions() && this.permissionForm && this.permissionForm.value.length > 0;
  }

  public isTabSelected(tab: CardColumnTabDTO): boolean {
    return this.permissionForm.getRawValue().find((permission: WorkflowCardTabDTO) => permission.tabId === tab.id);
  }
  public addRemoveTabFromPermissions(tab: CardColumnTabDTO) {
    this.permissionForm.markAsTouched();
    if (this.isTabSelected(tab)) {
      const index = this.permissionForm.getRawValue().findIndex((permission: WorkflowCardTabDTO) => permission.tabId === tab.id);
      this.permissionForm.removeAt(index);
      if (this.cardTabForm && this.cardTabForm.get('tabId').value === tab.id) {
        this.cardTabForm = null;
        this.selectedTab = null;
      }
    } else {
      const cardTabPermission = this.originalPermissions.find((permission: WorkflowCardTabDTO) => permission?.tabId === tab?.id);
      if (cardTabPermission) {
        const formCardTab = this.generateFormPermission(cardTabPermission);
        this.permissionForm.push(formCardTab);
        this.cardTabForm = formCardTab;
        this.selectedTab = tab;
      } else {
        const formCardTab = this.generateFormPermissionByTab(tab);
        this.permissionForm.push(formCardTab);
        this.cardTabForm = formCardTab;
        this.selectedTab = tab;
      }
      this.cardTabForm.valueChanges.pipe(untilDestroyed(this)).subscribe(() => {
        this.allPermisionForm.get('permission').setValue('');
      });
    }
  }
  public selectTabToShow(tab: CardColumnTabDTO) {
    this.allPermisionForm.get('permission').setValue('');
    if (this.isTabSelected(tab)) {
      const index = this.permissionForm.getRawValue().findIndex((permission: WorkflowCardTabDTO) => permission.tabId === tab.id);
      this.cardTabForm = this.permissionForm.at(index) as FormGroup;
      this.cardTabForm.valueChanges.pipe(untilDestroyed(this)).subscribe(() => {
        this.allPermisionForm.get('permission').setValue('');
      });
      this.selectedTab = tab;
    } else {
      this.cardTabForm = null;
      this.selectedTab = null;
    }
  }
  public confirmCloseCustomDialog(): Observable<boolean> {
    if (this.permissionForm.touched) {
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
          type: 'close',
          label: marker('common.cancel'),
          design: 'stroked',
          color: 'warn'
        }
      ],
      rightSideButtons: [
        {
          type: 'submit',
          label: marker('common.save'),
          design: 'raised',
          color: 'primary',
          disabledFn: () => !(this.permissionForm && this.permissionForm.touched && this.permissionForm.valid)
        }
      ]
    };
  }
  public changeAllPermissions(permission: string): void {
    const tabFormData = this.cardTabForm.getRawValue();
    tabFormData.workflowCardTabPermissions = tabFormData.workflowCardTabPermissions.map(
      (cardTabPermission: WorkflowCardTabPermissionsDTO) => {
        cardTabPermission.permissionType = permission as WorkFlowPermissionsEnum;
        return cardTabPermission;
      }
    );
    this.cardTabForm.patchValue(tabFormData);
    this.permissionForm.markAsTouched();
    this.allPermisionForm.get('permission').setValue('');
  }
  private initializeForm = (): void => {
    this.permissionForm = this.fb.array([]);
    this.allPermisionForm = this.fb.group({ permission: [''] });
    this.originalPermissions.forEach((permission: WorkflowCardTabDTO) => {
      if (this.cardData.cols.find((col) => col.tabs.find((tab) => tab.id === permission.tabId))) {
        this.permissionForm.push(this.generateFormPermission(permission));
      }
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
        if (this.roles.find((role: RoleDTO) => role?.id === permission?.role?.id)) {
          (form.get('workflowCardTabPermissions') as FormArray).push(this.generateTabPermission(permission));
        }
      });
    }
    const formData = form.getRawValue();
    this.roles.forEach((role) => {
      if (!formData.workflowCardTabPermissions.find((tabPer: WorkflowCardTabPermissionsDTO) => tabPer?.role?.id === role?.id)) {
        (form.get('workflowCardTabPermissions') as FormArray).push(this.generateTabPermissionByRole(role, cardPermission.id));
      }
    });
    return form;
  }
  private generateTabPermission(cardTabPermission: WorkflowCardTabPermissionsDTO): FormGroup {
    return this.fb.group({
      id: [cardTabPermission.id],
      permissionType: [cardTabPermission.permissionType],
      role: [cardTabPermission.role],
      workflowCardTabId: [cardTabPermission.workflowCardTabId]
    });
  }
  private generateFormPermissionByTab(tab: CardColumnTabDTO): FormGroup {
    const form = this.fb.group({
      id: [],
      tabId: [tab.id],
      workflowId: [this.workflowId],
      workflowCardTabPermissions: this.fb.array([])
    });
    this.roles.forEach((role: RoleDTO) => {
      (form.get('workflowCardTabPermissions') as FormArray).push(this.generateTabPermissionByRole(role));
    });
    return form;
  }
  private generateTabPermissionByRole(role: RoleDTO, cardTabId?: number): FormGroup {
    return this.fb.group({
      id: [null],
      permissionType: [WorkFlowPermissionsEnum.hide],
      role: [role],
      workflowCardTabId: [null]
    });
  }
}
