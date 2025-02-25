import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { actionsTabItems } from '@app/constants/actionsTabItems.constants';
import { ModulesConstants } from '@app/constants/modules.constants';
import { AuthenticationService } from '@app/security/authentication.service';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CardColumnDTO from '@data/models/cards/card-column-dto';
import CardColumnTabDTO from '@data/models/cards/card-column-tab-dto';
import VariablesDTO from '@data/models/variables-dto';
import { VariablesService } from '@data/services/variables.service';
// eslint-disable-next-line max-len
import {
  LinksCreationEditionDialogComponent,
  LinksCreationEditionDialogComponentModalEnum
} from '@modules/feature-modules/modal-links-creation-edition/links-creation-edition-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { CustomDialogService } from '@shared/modules/custom-dialog/services/custom-dialog.service';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { moveItemInFormArray } from '@shared/utils/moveItemInFormArray';
import { removeItemInFormArray } from '@shared/utils/removeItemInFormArray';
import CombinedRequiredFieldsValidator from '@shared/validators/combined-required-fields.validator';
import { finalize, take } from 'rxjs/operators';

@Component({
  selector: 'app-custom-actions',
  templateUrl: './custom-actions.component.html',
  styleUrls: ['./custom-actions.component.scss']
})
export class CustomActionsComponent implements OnInit {
  @Input() formCol: UntypedFormGroup;
  @Input() colEdit: CardColumnDTO;
  public listVariables: VariablesDTO[];
  public labels = {
    name: marker('common.name'),
    nameColumn: marker('cards.column.columnName'),
    nameRequired: marker('userProfile.nameRequired'),
    actionConfiguration: marker('cards.column.actionConfiguration'),
    shortcutConfiguration: marker('cards.column.shortcutConfiguration'),
    nameLink: marker('cards.column.linkName'),
    newLink: marker('cards.column.newLink'),
    tabSign: marker('common.actionsTabItems.sign'),
    tabMerssage: marker('common.actionsTabItems.message'),
    tabAttachment: marker('common.actionsTabItems.attachment'),
    tabStartConv: marker('common.actionsTabItems.startConversation'),
    shortcut: marker('common.shortcut'),
    actions: marker('common.actions')
  };
  public actionsTabItems = actionsTabItems;
  constructor(
    private fb: UntypedFormBuilder,
    private translateService: TranslateService,
    private confirmationDialog: ConfirmDialogService,
    private variablesService: VariablesService,
    private spinnerService: ProgressSpinnerDialogService,
    private customDialogService: CustomDialogService,
    private authService: AuthenticationService
  ) {}
  get form() {
    return this.formCol.controls;
  }
  get tabs(): UntypedFormArray {
    return this.formCol.get('tabs') as UntypedFormArray;
  }
  get tabItems(): UntypedFormArray {
    const tabsArray = this.formCol.controls.tabs as UntypedFormArray;
    const tabItemsArray = tabsArray.at(0).get('tabItems') as UntypedFormArray;
    for (let i = tabItemsArray.length - 1; i >= 0; i--) {
      const control = tabItemsArray.at(i) as UntypedFormGroup;
      const actionType = control.get('tabItemConfigAction')?.get('actionType')?.value;
      if (
        (actionType === 'START_CON' && !this.isContractedModule('whatsapp')) ||
        (actionType === 'SIGN_DOC' && !this.isContractedModule('checklist'))
      ) {
        tabItemsArray.removeAt(i);
      }
    }
    return tabItemsArray;
  }

  public isContractedModule(option: string): boolean {
    const configList = this.authService.getConfigList();
    if (option === 'checklist') {
      return configList.includes(ModulesConstants.CHECK_LIST);
    } else if (option === 'whatsapp') {
      return configList.includes(ModulesConstants.WHATSAPP_SEND);
    }
  }
  public deleteTab(tabItem: UntypedFormGroup) {
    this.confirmationDialog
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('cards.column.deleteLinkConfirmation'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          removeItemInFormArray(this.tabItems, tabItem.value.orderNumber - 1);
        }
      });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public drop(event: CdkDragDrop<string[]>) {
    moveItemInFormArray(this.tabItems, event.previousIndex, event.currentIndex);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public dropLink(event: CdkDragDrop<string[]>) {
    moveItemInFormArray(
      this.tabItems,
      event.previousIndex + this.actionsTabItems.length,
      event.currentIndex + this.actionsTabItems.length
    );
  }
  public showTabAction(tabItem: UntypedFormGroup) {
    const visible = tabItem.get('tabItemConfigAction').get('visible');
    visible.setValue(!visible.value);
  }
  public editTab(tab: UntypedFormGroup) {
    // console.log(tab);
    this.customDialogService
      .open({
        component: LinksCreationEditionDialogComponent,
        extendedComponentData: { form: tab, listVariables: this.listVariables },
        id: LinksCreationEditionDialogComponentModalEnum.ID,
        panelClass: LinksCreationEditionDialogComponentModalEnum.PANEL_CLASS,
        disableClose: true,
        width: '750px'
      })
      .subscribe((result) => {
        if (result?.tabItemConfigLink) {
          if (result.tabItemConfigLink.linkMethod === 'GET') {
            tab.get('tabItemConfigLink').get('body').setValue(null);
            if (result.tabItemConfigLink.redirect) {
              tab.get('tabItemConfigLink').get('requireAuth').setValue(false);
              result.tabItemConfigLink.requireAuth = false;
            }
          }
          if (result.tabItemConfigLink.linkMethod === 'POST') {
            tab.get('tabItemConfigLink').get('redirect').setValue(false);
          }
          if (!result.tabItemConfigLink.requireAuth) {
            tab.get('tabItemConfigLink').get('authPass').setValue(null);
            tab.get('tabItemConfigLink').get('authUrl').setValue(null);
            tab.get('tabItemConfigLink').get('authUser').setValue(null);
            tab.get('tabItemConfigLink').get('authAttributeToken').setValue(null);
          }
        }
      });
  }
  public newTab(tab?: CardColumnTabDTO): UntypedFormGroup {
    return this.fb.group({
      id: [tab ? tab.id : null],
      colId: [this.colEdit ? this.colEdit.id : null],
      orderNumber: [tab ? tab.orderNumber : this.tabs.length + 1, [Validators.required]],
      name: [tab ? tab.name : this.translateService.instant(this.labels.actions), [Validators.required]],
      type: [tab ? tab.type : 'CUSTOMIZABLE', [Validators.required]],
      contentTypeId: [tab ? tab.contentTypeId : 3, [Validators.required]],
      contentSourceId: [tab ? tab.contentSourceId : null],
      tabItems: this.generateTabItems(tab)
    });
  }
  public generateTabItems(tab?: CardColumnTabDTO): UntypedFormArray {
    const arrayForm = this.fb.array([]);
    if (tab) {
      tab.tabItems.forEach((tabItem) => {
        if (tabItem.typeItem === 'ACTION') {
          const actionType = tabItem.tabItemConfigAction.actionType;
          if (
            (actionType === 'SIGN_DOC' && !this.isContractedModule('checklist')) ||
            (actionType === 'START_CON' && !this.isContractedModule('whatsapp'))
          ) {
            return;
          }
          arrayForm.push(
            this.fb.group({
              id: [tabItem.id],
              tabId: [tab.id],
              typeItem: [tabItem.typeItem],
              orderNumber: [tabItem.orderNumber, [Validators.required]],
              name: [tabItem.name, [Validators.required]],
              tabItemConfigAction: this.fb.group({
                id: [tabItem.tabItemConfigAction.id],
                tabItemId: [tabItem.tabItemConfigAction.tabItemId],
                actionType: [tabItem.tabItemConfigAction.actionType],
                visible: [tabItem.tabItemConfigAction.visible]
              })
            })
          );
        } else if (tabItem.typeItem === 'LINK') {
          arrayForm.push(
            this.fb.group({
              id: [tabItem.id],
              tabId: [tab.id],
              typeItem: [tabItem.typeItem],
              orderNumber: [tabItem.orderNumber, [Validators.required]],
              name: [tabItem.name, [Validators.required]],
              tabItemConfigLink: this.fb.group(
                {
                  id: [tabItem.tabItemConfigLink.id],
                  tabItemId: [tabItem.tabItemConfigLink.tabItemId],
                  link: [tabItem.tabItemConfigLink.link, [Validators.required]],
                  color: [tabItem.tabItemConfigLink.color, [Validators.required]],
                  variables: [tabItem.tabItemConfigLink.variables],
                  linkMethod: [tabItem.tabItemConfigLink.linkMethod, [Validators.required]],
                  body: [
                    tabItem.tabItemConfigLink.linkMethod === 'GET'
                      ? null
                      : tabItem.tabItemConfigLink.body ?? '{ "attribute": "example", "attribute2": "example2" }'
                  ],
                  redirect: [tabItem.tabItemConfigLink.redirect],
                  requireAuth: [tabItem.tabItemConfigLink.requireAuth],
                  authUrl: [tabItem.tabItemConfigLink.authUrl],
                  authUser: [tabItem.tabItemConfigLink.authUser],
                  authPass: [tabItem.tabItemConfigLink.authPass],
                  authAttributeToken: [tabItem.tabItemConfigLink.authAttributeToken]
                },
                {
                  validators: [
                    CombinedRequiredFieldsValidator.field1RequiredIfFieldsConditions('body', [
                      { control: 'linkMethod', operation: 'equal', value: 'POST' }
                    ]),
                    CombinedRequiredFieldsValidator.field1RequiredIfFieldsConditions('authUrl', [
                      { control: 'requireAuth', operation: 'equal', value: true }
                    ]),
                    CombinedRequiredFieldsValidator.field1RequiredIfFieldsConditions('authUser', [
                      { control: 'requireAuth', operation: 'equal', value: true }
                    ]),
                    CombinedRequiredFieldsValidator.field1RequiredIfFieldsConditions('authPass', [
                      { control: 'requireAuth', operation: 'equal', value: true }
                    ]),
                    CombinedRequiredFieldsValidator.field1RequiredIfFieldsConditions('authAttributeToken', [
                      { control: 'requireAuth', operation: 'equal', value: true }
                    ])
                  ]
                }
              )
            })
          );
        }
      });
      actionsTabItems.forEach((tabItem, index) => {
        let tabItemSetted = false;
        tab.tabItems.forEach((tabItemAux) => {
          if (tabItemAux.typeItem === 'ACTION' && tabItemAux.tabItemConfigAction.actionType === tabItem.actionType) {
            tabItemSetted = true;
          }
        });
        if (!tabItemSetted) {
          arrayForm.push(
            this.fb.group({
              id: [null],
              tabId: [null],
              typeItem: ['ACTION'],
              orderNumber: [arrayForm.length, [Validators.required]],
              name: [this.translateService.instant(tabItem.name), [Validators.required]],
              tabItemConfigAction: this.fb.group({
                id: [null],
                tabItemId: [null],
                actionType: [tabItem.actionType],
                visible: [true]
              })
            })
          );
          moveItemInFormArray(arrayForm, arrayForm.length - 1, index);
        }
      });
    } else {
      actionsTabItems.forEach((tabItem, index) => {
        arrayForm.push(
          this.fb.group({
            id: [null],
            tabId: [null],
            typeItem: ['ACTION'],
            orderNumber: [index + 1, [Validators.required]],
            name: [this.translateService.instant(tabItem.name), [Validators.required]],
            tabItemConfigAction: this.fb.group({
              id: [null],
              tabItemId: [null],
              actionType: [tabItem.actionType],
              visible: [true]
            })
          })
        );
      });
    }
    return arrayForm;
  }
  public newTabItemLink() {
    this.tabItems.push(
      this.fb.group({
        id: [null],
        tabId: [null],
        typeItem: ['LINK'],
        orderNumber: [this.tabItems.length + 1, [Validators.required]],
        name: [this.translateService.instant(this.labels.nameLink), [Validators.required]],
        tabItemConfigLink: this.fb.group(
          {
            id: [null],
            tabItemId: [null],
            link: ['', [Validators.required]],
            color: ['#FFFFFF'],
            variables: [null],
            linkMethod: ['GET', [Validators.required]],
            body: ['{ "attribute": "example", "attribute2": "example2" }'],
            redirect: [false],
            requireAuth: [false],
            authUrl: [null],
            authUser: [null],
            authPass: [null],
            authAttributeToken: [null]
          },
          {
            validators: [
              CombinedRequiredFieldsValidator.field1RequiredIfFieldsConditions('body', [
                { control: 'linkMethod', operation: 'equal', value: 'POST' }
              ]),
              CombinedRequiredFieldsValidator.field1RequiredIfFieldsConditions('authUrl', [
                { control: 'requireAuth', operation: 'equal', value: true }
              ]),
              CombinedRequiredFieldsValidator.field1RequiredIfFieldsConditions('authUser', [
                { control: 'requireAuth', operation: 'equal', value: true }
              ]),
              CombinedRequiredFieldsValidator.field1RequiredIfFieldsConditions('authPass', [
                { control: 'requireAuth', operation: 'equal', value: true }
              ]),
              CombinedRequiredFieldsValidator.field1RequiredIfFieldsConditions('authAttributeToken', [
                { control: 'requireAuth', operation: 'equal', value: true }
              ])
            ]
          }
        )
      })
    );
  }

  ngOnInit(): void {
    this.filterActionsTabItems();
    this.getVariable();
    if (this.colEdit) {
      this.colEdit.tabs.forEach((tab) => {
        this.tabs.push(this.newTab(tab));
      });
    } else {
      this.tabs.push(this.newTab());
    }
  }

  private filterActionsTabItems(): void {
    this.actionsTabItems = this.actionsTabItems.filter((actionItem) => {
      if (
        (actionItem.actionType === 'SIGN_DOC' && !this.isContractedModule('checklist')) ||
        (actionItem.actionType === 'START_CON' && !this.isContractedModule('whatsapp'))
      ) {
        return false;
      }
      return true;
    });
  }

  private getVariable(): void {
    const spinner = this.spinnerService.show();
    this.variablesService
      .searchVariables()
      .pipe(
        take(1),
        finalize(() => this.spinnerService.hide(spinner))
      )
      .subscribe((res) => {
        this.listVariables = res;
      });
  }
}
