import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CardColumnTabDTO from '@data/models/cards/card-column-tab-dto';
import CardColumnTabItemDTO from '@data/models/cards/card-column-tab-item-dto';
import CardDTO from '@data/models/cards/card-dto';
import { TemplateAtachmentItemsDTO } from '@data/models/templates/templates-attachment-dto';
import RoleDTO from '@data/models/user-permissions/role-dto';
import WorkflowCardTabDTO from '@data/models/workflow-admin/workflow-card-tab-dto';
import WorkflowCardTabItemPermissionDTO from '@data/models/workflow-admin/workflow-card-tab-item-permissions-dto';
import WorkflowCardTabPermissionsDTO, {
  WorkFlowPermissionsEnum
} from '@data/models/workflow-admin/workflow-card-tab-permissions-dto';
import WorkflowCardTabTAIPermissionDTO from '@data/models/workflow-admin/workflow-card-tab-tai-permissions-dto';
import { CardService } from '@data/services/cards.service';
import { WorkflowAdministrationService } from '@data/services/workflow-administration.service';
import { ComponentToExtendForCustomDialog, CustomDialogService, CustomDialogFooterConfigI } from '@frontend/custom-dialog';
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
  public tabs: CardColumnTabDTO[] = [];
  public roles: RoleDTO[];
  public selectedTab: CardColumnTabDTO;
  public selectedTempAttch: TemplateAtachmentItemsDTO;
  public selectedLinkItem: CardColumnTabItemDTO;
  public allPermisionForm: FormGroup;
  public templateAttachments: { [key: number]: TemplateAtachmentItemsDTO[] } = {};
  public attachmentTabIds: number[] = [];
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
  get workflowCardPermissions(): UntypedFormControl[] {
    if (this.selectedTab && this.selectedLinkItem) {
      return (this.cardTabForm.get('workflowCardTabItemPermissions') as FormArray).controls.filter(
        (fc) => fc.get('tabItemId').value === this.selectedLinkItem.id
      ) as UntypedFormControl[];
    } else if (this.selectedTab && this.selectedTempAttch) {
      return (this.cardTabForm.get('workflowCardTabTAIPermissions') as FormArray).controls.filter(
        (fc) => fc.get('templateAttachmentItemId').value === this.selectedTempAttch.id
      ) as UntypedFormControl[];
    }
    return (this.cardTabForm.get('workflowCardTabPermissions') as FormArray).controls as UntypedFormControl[];
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
      //Dentro de los tabItems que hay por cada col debo buscar el tab con contentTypeId igual a 5 y quedarme con su id
      this.attachmentTabIds = [];
      this.cardData.cols.forEach((col) => {
        col.tabs.forEach((tab) => {
          this.tabs.push(tab);
          if (tab.contentTypeId === 5) {
            this.attachmentTabIds.push(tab.id);
          }
        });
      });
      if (this.attachmentTabIds.length > 0) {
        const requests = this.attachmentTabIds.map((tabId) =>
          this.workflowService.getWorkflowTemplateAttachments(tabId).pipe(take(1))
        );
        forkJoin(requests).subscribe((responses: TemplateAtachmentItemsDTO[][]) => {
          responses.forEach((response, index) => {
            this.templateAttachments[this.attachmentTabIds[index]] = response;
          });
          this.initializeForm();
          this.spinnerService.hide(spinner);
        });
      } else {
        this.initializeForm();
        this.spinnerService.hide(spinner);
      }
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
    return this.permissionForm?.getRawValue()?.find((permission: WorkflowCardTabDTO) => permission.tabId === tab.id);
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
    this.selectedTempAttch = null;
    this.selectedLinkItem = null;
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
  public selectTmpAtchToShow(tab: CardColumnTabDTO, tmpAtch: TemplateAtachmentItemsDTO) {
    this.selectedTab = tab;
    this.selectedLinkItem = null;
    this.selectedTempAttch = tmpAtch;
    this.allPermisionForm.get('permission').setValue('');
    const index = this.permissionForm.getRawValue().findIndex((permission: WorkflowCardTabDTO) => permission.tabId === tab.id);
    this.cardTabForm = this.permissionForm.at(index) as FormGroup;
  }
  public getLinkTabItems(tab: CardColumnTabDTO): CardColumnTabItemDTO[] {
    if (!tab?.tabItems?.length) {
      return [];
    }
    return tab.tabItems.filter((item: CardColumnTabItemDTO) => item.typeItem === 'LINK');
  }
  public selectLinkItemToShow(tab: CardColumnTabDTO, linkItem: CardColumnTabItemDTO) {
    this.selectedTab = tab;
    this.selectedTempAttch = null;
    this.selectedLinkItem = linkItem;
    this.allPermisionForm.get('permission').setValue('');
    const index = this.permissionForm.getRawValue().findIndex((permission: WorkflowCardTabDTO) => permission.tabId === tab.id);
    this.cardTabForm = this.permissionForm.at(index) as FormGroup;
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
    if (!this.selectedLinkItem && !this.selectedTempAttch) {
      tabFormData.workflowCardTabPermissions = tabFormData.workflowCardTabPermissions.map(
        (cardTabPermission: WorkflowCardTabPermissionsDTO) => {
          cardTabPermission.permissionType = permission as WorkFlowPermissionsEnum;
          return cardTabPermission;
        }
      );
    } else if (this.selectedLinkItem) {
      tabFormData.workflowCardTabItemPermissions = tabFormData.workflowCardTabItemPermissions.map(
        (cardTabPermission: WorkflowCardTabItemPermissionDTO) => {
          if (cardTabPermission.tabItemId === this.selectedLinkItem.id) {
            cardTabPermission.permissionType = permission as WorkFlowPermissionsEnum;
          }
          return cardTabPermission;
        }
      );
    } else if (this.selectedTempAttch) {
      tabFormData.workflowCardTabTAIPermissions = tabFormData.workflowCardTabTAIPermissions.map(
        (cardTabPermission: WorkflowCardTabTAIPermissionDTO) => {
          if (cardTabPermission.templateAttachmentItemId === this.selectedTempAttch.id) {
            cardTabPermission.permissionType = permission as WorkFlowPermissionsEnum;
          }
          return cardTabPermission;
        }
      );
    }
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
      workflowCardTabPermissions: this.fb.array([]),
      workflowCardTabItemPermissions: this.fb.array([]),
      workflowCardTabTAIPermissions: this.fb.array([])
    });
    if (cardPermission && cardPermission.workflowCardTabPermissions && cardPermission.workflowCardTabPermissions.length) {
      cardPermission.workflowCardTabPermissions.forEach((permission: WorkflowCardTabPermissionsDTO) => {
        if (this.roles.find((role: RoleDTO) => role?.id === permission?.role?.id)) {
          (form.get('workflowCardTabPermissions') as FormArray).push(this.generateTabPermission(permission));
        }
      });
    }
    // LINKS
    cardPermission.workflowCardTabItemPermissions = cardPermission.workflowCardTabItemPermissions || [];
    const tab = this.tabs.find((item: CardColumnTabDTO) => item.id === cardPermission.tabId);
    this.getLinkTabItems(tab).forEach((linkItem) => {
      const rolesSettedForLinkItem = cardPermission.workflowCardTabItemPermissions
        .filter((tabPer: WorkflowCardTabItemPermissionDTO) => tabPer?.tabItemId === linkItem?.id)
        .map((tabPer: WorkflowCardTabItemPermissionDTO) => tabPer?.role?.id);
      this.roles.forEach((role) => {
        if (!rolesSettedForLinkItem.includes(role.id)) {
          cardPermission.workflowCardTabItemPermissions.push({
            id: null,
            permissionType: WorkFlowPermissionsEnum.hide,
            role,
            tabItemId: linkItem.id,
            workflowCardTabId: cardPermission.id
          });
        }
      });
    });
    if (cardPermission.workflowCardTabItemPermissions.length > 0) {
      cardPermission.workflowCardTabItemPermissions.forEach((permission: WorkflowCardTabItemPermissionDTO) => {
        if (this.roles.find((role: RoleDTO) => role?.id === permission?.role?.id)) {
          (form.get('workflowCardTabItemPermissions') as FormArray).push(this.generateTabPermission(permission));
        }
      });
    }
    // Tabs adjuntos
    cardPermission.workflowCardTabTAIPermissions = cardPermission.workflowCardTabTAIPermissions || [];
    if (this.attachmentTabIds.includes(cardPermission.tabId)) {
      this.templateAttachments[cardPermission.tabId].forEach((tempAtt) => {
        const rolesSettedForTAI = cardPermission.workflowCardTabTAIPermissions
          .filter((tabPer: WorkflowCardTabTAIPermissionDTO) => tabPer?.templateAttachmentItemId === tempAtt?.id)
          .map((tabPer: WorkflowCardTabTAIPermissionDTO) => tabPer?.role?.id);
        this.roles.forEach((role) => {
          if (!rolesSettedForTAI.includes(role.id)) {
            cardPermission.workflowCardTabTAIPermissions.push({
              id: null,
              permissionType: WorkFlowPermissionsEnum.hide,
              role,
              templateAttachmentItemId: tempAtt.id,
              workflowCardTabId: cardPermission.id
            });
          }
        });
      });
      if (cardPermission.workflowCardTabTAIPermissions.length > 0) {
        cardPermission.workflowCardTabTAIPermissions.forEach((permission: WorkflowCardTabTAIPermissionDTO) => {
          if (this.roles.find((role: RoleDTO) => role?.id === permission?.role?.id)) {
            (form.get('workflowCardTabTAIPermissions') as FormArray).push(this.generateTabPermission(permission));
          }
        });
      }
    }
    const formData = form.getRawValue();
    this.roles.forEach((role) => {
      if (!formData.workflowCardTabPermissions.find((tabPer: WorkflowCardTabPermissionsDTO) => tabPer?.role?.id === role?.id)) {
        (form.get('workflowCardTabPermissions') as FormArray).push(this.generateTabPermissionByRole(role, cardPermission.id));
      }
    });
    return form;
  }
  private generateTabPermission(
    cardTabPermission: WorkflowCardTabPermissionsDTO | WorkflowCardTabItemPermissionDTO | WorkflowCardTabTAIPermissionDTO
  ): FormGroup {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {
      id: [cardTabPermission.id],
      permissionType: [cardTabPermission.permissionType],
      role: [cardTabPermission.role],
      workflowCardTabId: [cardTabPermission.workflowCardTabId]
    };
    if (cardTabPermission.hasOwnProperty('tabItemId')) {
      data.tabItemId = [(cardTabPermission as WorkflowCardTabItemPermissionDTO).tabItemId];
    } else if (cardTabPermission.hasOwnProperty('templateAttachmentItemId')) {
      data.templateAttachmentItemId = [(cardTabPermission as WorkflowCardTabTAIPermissionDTO).templateAttachmentItemId];
    }
    return this.fb.group(data);
  }
  private generateFormPermissionByTab(tab: CardColumnTabDTO): FormGroup {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formData: any = {
      id: [],
      tabId: [tab.id],
      workflowId: [this.workflowId],
      workflowCardTabItemPermissions: this.fb.array([]),
      workflowCardTabPermissions: this.fb.array([]),
      workflowCardTabTAIPermissions: this.fb.array([])
    };
    const form = this.fb.group(formData);
    this.roles.forEach((role: RoleDTO) => {
      (form.get('workflowCardTabPermissions') as FormArray).push(this.generateTabPermissionByRole(role));
    });
    //Tab de tipo Attachments
    if (this.attachmentTabIds.includes(tab.id)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const workflowCardTabTAIPermissions: any[] = [];
      console.log(tab.id, this.templateAttachments);
      this.templateAttachments[tab.id].forEach((tempAtt) => {
        this.roles.forEach((role) => {
          workflowCardTabTAIPermissions.push({
            id: null,
            permissionType: WorkFlowPermissionsEnum.hide,
            role,
            templateAttachmentItemId: tempAtt.id,
            workflowCardTabId: null
          });
        });
      });
      if (workflowCardTabTAIPermissions.length > 0) {
        workflowCardTabTAIPermissions.forEach((permission: WorkflowCardTabTAIPermissionDTO) => {
          if (this.roles.find((role: RoleDTO) => role?.id === permission?.role?.id)) {
            (form.get('workflowCardTabTAIPermissions') as FormArray).push(this.generateTabPermission(permission));
          }
        });
      }
    }

    //Tab de tipo Link
    if (tab.tabItems?.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const workflowCardTabItemPermissions: any[] = [];
      this.getLinkTabItems(tab).forEach((linkItem) => {
        this.roles.forEach((role) => {
          workflowCardTabItemPermissions.push({
            id: null,
            permissionType: WorkFlowPermissionsEnum.hide,
            role,
            tabItemId: linkItem.id,
            workflowCardTabId: null
          });
        });
      });
      if (workflowCardTabItemPermissions.length > 0) {
        workflowCardTabItemPermissions.forEach((permission: WorkflowCardTabItemPermissionDTO) => {
          if (this.roles.find((role: RoleDTO) => role?.id === permission?.role?.id)) {
            (form.get('workflowCardTabItemPermissions') as FormArray).push(this.generateTabPermission(permission));
          }
        });
      }
    }

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
