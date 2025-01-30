/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatMenuTrigger } from '@angular/material/menu';
import { ModulesConstants } from '@app/constants/modules.constants';
import { AuthenticationService } from '@app/security/authentication.service';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import TreeNode from '@data/interfaces/tree-node';
import CardColumnDTO from '@data/models/cards/card-column-dto';
import CardColumnTabDTO from '@data/models/cards/card-column-tab-dto';
import CardColumnTabItemDTO from '@data/models/cards/card-column-tab-item-dto';
import WorkflowViewDTO from '@data/models/workflow-admin/workflow-view-dto';
import { WorkflowAdministrationService } from '@data/services/workflow-administration.service';
import { UntilDestroy } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { NGXLogger } from 'ngx-logger';
import { forkJoin } from 'rxjs';
import { finalize, take } from 'rxjs/operators';
import { WorkflowsCreateEditAuxService } from '../../../aux-service/workflows-create-edit-aux.service';
import { WorkflowStepAbstractClass } from '../workflow-step-abstract-class';

@UntilDestroy()
@Component({
  selector: 'app-workflow-card-config',
  templateUrl: './workflow-card-config.component.html',
  styleUrls: ['./workflow-card-config.component.scss']
})
export class WorkflowCardConfigComponent extends WorkflowStepAbstractClass implements OnInit {
  @Input() workflowId: number;
  @Input() stepIndex: number;
  @ViewChild('menuTrigger') trigger: MatMenuTrigger;
  public labels = {
    boardView: marker('workflows.cardsInBoardView'),
    calendarView: marker('workflows.cardsInCalendarView'),
    tableView: marker('workflows.cardsInTableView'),
    landingCardView: marker('workflows.landingCardView'),
    landingDetailView: marker('workflows.landingDetailView'),
    field: marker('common.field'),
    required: marker('errors.required'),
    select: marker('common.select'),
    addField: marker('workflows.addField'),
    cardDetailHeaderField: marker('workflows.cardDetailHeaderField')
  };
  public treeData: TreeNode[] = [];
  private lastInputSelected: {
    viewType: 'BOARD' | 'TABLE' | 'CALENDAR' | 'LANDING_CARD' | 'LANDING_DETAIL' | 'DETAIL';
    fieldIndex: number;
  };

  constructor(
    private fb: UntypedFormBuilder,
    public workflowsCreateEditAuxService: WorkflowsCreateEditAuxService,
    private spinnerService: ProgressSpinnerDialogService,
    public confirmationDialog: ConfirmDialogService,
    public translateService: TranslateService,
    public workflowService: WorkflowAdministrationService,
    private globalMessageService: GlobalMessageService,
    private logger: NGXLogger,
    private authService: AuthenticationService
  ) {
    super(workflowsCreateEditAuxService, confirmationDialog, translateService);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  public initForm(data: any): void {
    const dataByViewType: {
      BOARD: WorkflowViewDTO[];
      TABLE: WorkflowViewDTO[];
      CALENDAR: WorkflowViewDTO[];
      LANDING_CARD: WorkflowViewDTO[];
      LANDING_DETAIL: WorkflowViewDTO[];
      DETAIL: WorkflowViewDTO[];
    } = {
      BOARD: [],
      TABLE: [],
      CALENDAR: [],
      LANDING_CARD: [],
      LANDING_DETAIL: [],
      DETAIL: []
    };
    if (data?.view) {
      ['TABLE', 'CALENDAR', 'BOARD', 'LANDING_CARD', 'LANDING_DETAIL', 'DETAIL'].forEach(
        (view: 'TABLE' | 'CALENDAR' | 'BOARD' | 'LANDING_CARD' | 'LANDING_DETAIL' | 'DETAIL') => {
          dataByViewType[view] = data.view
            .filter((d: WorkflowViewDTO) => d.viewType === view)
            .sort((a: WorkflowViewDTO, b: WorkflowViewDTO) => a.orderNumber - b.orderNumber);
        }
      );
    }
    this.form = this.fb.group({
      BOARD: this.fb.group({
        field1: this.getFieldFormGroup('BOARD', 1, dataByViewType.BOARD?.length >= 1 ? dataByViewType.BOARD[0] : null),
        field2: this.getFieldFormGroup('BOARD', 2, dataByViewType.BOARD?.length >= 2 ? dataByViewType.BOARD[1] : null),
        field3: this.getFieldFormGroup('BOARD', 3, dataByViewType.BOARD?.length >= 3 ? dataByViewType.BOARD[2] : null)
      }),
      CALENDAR: this.fb.group({
        field1: this.getFieldFormGroup('CALENDAR', 1, dataByViewType.CALENDAR?.length >= 1 ? dataByViewType.CALENDAR[0] : null),
        field2: this.getFieldFormGroup('CALENDAR', 2, dataByViewType.CALENDAR?.length >= 2 ? dataByViewType.CALENDAR[1] : null),
        field3: this.getFieldFormGroup('CALENDAR', 3, dataByViewType.CALENDAR?.length >= 3 ? dataByViewType.CALENDAR[2] : null)
      }),
      LANDING_CARD: this.fb.group({
        field1: this.getFieldFormGroup(
          'LANDING_CARD',
          1,
          dataByViewType.LANDING_CARD?.length >= 1 ? dataByViewType.LANDING_CARD[0] : null
        ),
        field2: this.getFieldFormGroup(
          'LANDING_CARD',
          2,
          dataByViewType.LANDING_CARD?.length >= 2 ? dataByViewType.LANDING_CARD[1] : null
        ),
        field3: this.getFieldFormGroup(
          'LANDING_CARD',
          3,
          dataByViewType.LANDING_CARD?.length >= 3 ? dataByViewType.LANDING_CARD[2] : null
        )
      }),
      LANDING_DETAIL: this.getLandingDetailViewFormGroups(dataByViewType.LANDING_DETAIL),
      TABLE: this.getTableViewFormGroups(dataByViewType.TABLE),
      DETAIL: this.fb.group({
        field1: this.getFieldFormGroup('DETAIL', 1, dataByViewType.DETAIL?.length >= 1 ? dataByViewType.DETAIL[0] : null)
      })
    });
  }

  public isContractedModule(option: string): boolean {
    const configList = this.authService.getConfigList();
    if (option === 'listView') {
      return configList.includes(ModulesConstants.LIST_VIEW);
    } else if (option === 'calendarView') {
      return configList.includes(ModulesConstants.CALENDAR_VIEW);
    }
  }

  public selectAttribute(node: CardColumnTabItemDTO): void {
    this.form
      .get(`${this.lastInputSelected.viewType}.field${this.lastInputSelected.fieldIndex}.tabItem`)
      ?.setValue(this.originalData.tabItems.find((item: CardColumnTabItemDTO) => item.id === node.id));
    this.form.get(`${this.lastInputSelected.viewType}.field${this.lastInputSelected.fieldIndex}.tabItem`)?.markAsDirty();
    this.form.get(`${this.lastInputSelected.viewType}.field${this.lastInputSelected.fieldIndex}.tabItem`)?.markAsTouched();
    // this.form.get(`${this.lastInputSelected.viewType}`)?.markAsDirty();
    // this.form.get(`${this.lastInputSelected.viewType}`)?.markAsTouched();
    this.trigger.closeMenu();
  }

  public async getWorkflowStepData(): Promise<boolean> {
    const spinner = this.spinnerService.show();
    return new Promise((resolve, reject) => {
      const resquests = [
        this.workflowService.getWorkflowViews(this.workflowId).pipe(take(1)),
        this.workflowService.getWorkflowViewAttributes(this.workflowId).pipe(take(1))
      ];

      forkJoin(resquests).subscribe(
        (responses: [WorkflowViewDTO[], CardColumnDTO[]]) => {
          this.originalData = {
            //Workflow views
            view: responses[0],
            //Views attributes
            attributes: responses[1]
          };
          this.createAttrTree();
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
      const rawData: any = this.form.getRawValue();
      const dataToSend: any = [];
      ['CALENDAR', 'BOARD', 'TABLE', 'LANDING_CARD', 'LANDING_DETAIL', 'DETAIL'].forEach((viewType) => {
        Object.keys(rawData[viewType]).forEach((k) => {
          if (rawData[viewType][k].tabItem) {
            dataToSend.push(rawData[viewType][k]);
          }
        });
      });
      this.workflowService
        .postWorkflowViews(this.workflowId, dataToSend)
        .pipe(
          take(1),
          finalize(() => this.spinnerService.hide(spinner))
        )
        .subscribe(
          (response) => {
            resolve(true);
          },
          (error: ConcenetError) => {
            this.logger.error(error);
            this.globalMessageService.showError({
              message: error.message,
              actionText: this.translateService.instant(marker('common.close'))
            });
            resolve(false);
          }
        );
    });
  }

  public getNumberOfFields(viewType: 'BOARD' | 'CALENDAR' | 'TABLE' | 'LANDING_CARD' | 'LANDING_DETAIL' | 'DETAIL'): number[] {
    const arr = [];
    for (let x = 1; x <= Object.keys(this.form.get(viewType).value).length; x++) {
      arr.push(x);
    }
    return arr;
  }

  public addField(viewType: 'BOARD' | 'CALENDAR' | 'TABLE' | 'LANDING_CARD' | 'LANDING_DETAIL' | 'DETAIL'): void {
    const orderNumber: number = Object.keys(this.form.get(viewType).value).length + 1;
    (this.form.get(viewType) as UntypedFormGroup).addControl(
      `field${orderNumber}`,
      this.getFieldFormGroup(viewType, orderNumber, null)
    );
  }

  public deleteField(
    viewType: 'BOARD' | 'CALENDAR' | 'TABLE' | 'LANDING_CARD' | 'LANDING_DETAIL' | 'DETAIL',
    fieldIndex: number
  ): void {
    (this.form.get(viewType) as UntypedFormGroup).removeControl(`field${fieldIndex}`);
  }

  public isLastFieldAndNotFirst(
    viewType: 'BOARD' | 'CALENDAR' | 'TABLE' | 'LANDING_CARD' | 'LANDING_DETAIL' | 'DETAIL',
    fieldIndex: number
  ): boolean {
    return fieldIndex !== 1 && Object.keys(this.form.get(viewType).value).length === fieldIndex;
  }

  public hasErrorIn(
    viewType: 'BOARD' | 'CALENDAR' | 'TABLE' | 'LANDING_CARD' | 'LANDING_DETAIL' | 'DETAIL',
    fieldIndex: number
  ): boolean {
    return !this.form.get(`${viewType}.field${fieldIndex}`)?.valid;
  }

  public hasValue(
    viewType: 'BOARD' | 'CALENDAR' | 'TABLE' | 'LANDING_CARD' | 'LANDING_DETAIL' | 'DETAIL',
    fieldIndex: number
  ): boolean {
    return this.form.get(`${viewType}.field${fieldIndex}`)?.value?.tabItem?.id;
  }

  public clearField(
    viewType: 'BOARD' | 'CALENDAR' | 'TABLE' | 'LANDING_CARD' | 'LANDING_DETAIL' | 'DETAIL',
    fieldIndex: number
  ): void {
    this.form.get(`${viewType}.field${fieldIndex}.tabItem`)?.setValue(null);
    this.form.get(`${viewType}.field${fieldIndex}.tabItem`)?.markAsDirty();
    this.form.get(`${viewType}.field${fieldIndex}.tabItem`)?.markAsTouched();
  }

  public setTabItemTo(
    viewType: 'BOARD' | 'CALENDAR' | 'TABLE' | 'LANDING_CARD' | 'LANDING_DETAIL' | 'DETAIL',
    fieldIndex: number
  ): void {
    this.lastInputSelected = { viewType, fieldIndex };
  }

  private getFieldFormGroup(
    viewType: 'BOARD' | 'CALENDAR' | 'TABLE' | 'LANDING_CARD' | 'LANDING_DETAIL' | 'DETAIL',
    orderNumber: number,
    data?: WorkflowViewDTO
  ): UntypedFormGroup {
    let validations = [Validators.required];
    //La validación sólo se aplica al primer campo
    if (orderNumber > 1 || viewType !== 'BOARD') {
      validations = [];
    }
    const formGroup: UntypedFormGroup = this.fb.group({
      id: [data ? data.id : null],
      orderNumber: [data ? data.orderNumber : orderNumber],
      viewType: [viewType, validations],
      tabItem: [
        data?.tabItem ? this.originalData.tabItems.find((item: CardColumnTabItemDTO) => item.id === data.tabItem.id) : null,
        validations
      ]
    });
    return formGroup;
  }

  private getTableViewFormGroups(data: WorkflowViewDTO[]): UntypedFormGroup {
    const formGroup: UntypedFormGroup = this.fb.group({});
    data.forEach((value: WorkflowViewDTO, index) => {
      const orderNumber = index + 1;
      formGroup.addControl(`field${orderNumber}`, this.getFieldFormGroup('TABLE', orderNumber, value));
    });
    for (let n = data.length; n < 1; n++) {
      formGroup.addControl(`field${n + 1}`, this.getFieldFormGroup('TABLE', n + 1, null));
    }
    return formGroup;
  }

  private getLandingDetailViewFormGroups(data: WorkflowViewDTO[]): UntypedFormGroup {
    const formGroup: UntypedFormGroup = this.fb.group({});
    data.forEach((value: WorkflowViewDTO, index) => {
      const orderNumber = index + 1;
      formGroup.addControl(`field${orderNumber}`, this.getFieldFormGroup('LANDING_DETAIL', orderNumber, value));
    });
    for (let n = data.length; n < 1; n++) {
      formGroup.addControl(`field${n + 1}`, this.getFieldFormGroup('LANDING_DETAIL', n + 1, null));
    }
    return formGroup;
  }

  private createAttrTree() {
    let attrs: CardColumnTabItemDTO[] = [];
    this.originalData.attributes.forEach((cardColumn: CardColumnDTO) => {
      cardColumn.children = cardColumn.tabs;
      cardColumn.children.forEach((cardColumnTab: CardColumnTabDTO) => {
        cardColumnTab.tabItems.forEach((tabItem: CardColumnTabItemDTO) => {
          tabItem.frontName = `${tabItem.name} (${cardColumn.name} - ${cardColumnTab.name})`;
        });
        cardColumnTab.children = cardColumnTab.tabItems;
        attrs = [...attrs, ...cardColumnTab.tabItems];
      });
    });
    this.originalData.tabItems = attrs;
    this.treeData = this.originalData.attributes;
  }
}
