/* eslint-disable @typescript-eslint/no-explicit-any */
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { PermissionConstants } from '@app/constants/permission.constants';
import { AuthenticationService } from '@app/security/authentication.service';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import AdvSearchDTO, { AdvancedSearchContext, AdvancedSearchItem } from '@data/models/adv-search/adv-search-dto';
import AdvSearchOperatorDTO from '@data/models/adv-search/adv-search-operator-dto';
import AdvancedSearchOptionsDTO from '@data/models/adv-search/adv-search-options-dto';
import FacilityDTO from '@data/models/organization/facility-dto';
import WorkflowCreateCardDTO from '@data/models/workflows/workflow-create-card-dto';
import WorkflowStateDTO from '@data/models/workflows/workflow-state-dto';
import WorkflowSubstateDTO from '@data/models/workflows/workflow-substate-dto';
import { AdvSearchService } from '@data/services/adv-search.service';
import { FacilityService } from '@data/services/facility.sevice';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import { CustomDialogService } from '@shared/modules/custom-dialog/services/custom-dialog.service';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { haveArraysSameValues } from '@shared/utils/array-comparation-function';
import { moveItemInFormArray } from '@shared/utils/moveItemInFormArray';
import { removeItemInFormArray } from '@shared/utils/removeItemInFormArray';
import { EmailValidator } from '@shared/validators/fav-email.validator';
import _ from 'lodash';
import moment from 'moment';
import { NGXLogger } from 'ngx-logger';
import { Observable, forkJoin, map, startWith, take } from 'rxjs';
import { WorkflowPrepareAndMoveService } from '../workflow/aux-service/workflow-prepare-and-move-aux.service';
import { AdvSearchCardTableComponent } from './components/adv-search-card-table/adv-search-card-table.component';
import {
  AdvSearchCriteriaDialogComponent,
  AdvSearchCriteriaDialogComponentModalEnum
} from './components/adv-search-criteria-dialog/adv-search-criteria-dialog.component';
import {
  AdvSearchCriteriaEditionDialogComponent,
  AdvSearchCriteriaEditionDialogComponentModalEnum
} from './components/adv-search-criteria-edition-dialog/adv-search-criteria-edition-dialog.component';
import {
  AdvSearchSaveFavDialogComponent,
  AdvSearchSaveFavDialogComponentModalEnum
} from './components/adv-search-save-fav-dialog/adv-search-save-fav-dialog.component';

@UntilDestroy()
@Component({
  selector: 'app-advanced-search',
  templateUrl: './advanced-search.component.html',
  styleUrls: ['./advanced-search.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AdvancedSearchComponent implements OnInit {
  @ViewChild('searchTable') table: AdvSearchCardTableComponent;
  @ViewChild('favDrawer') favDrawer: MatDrawer;
  @ViewChild('drawerCont') drawerCont: MatDrawer;
  public labels = {
    favSearch: marker('advSearch.favSearch'),
    savedSearch: marker('advSearch.savedSearch'),
    critSearch: marker('advSearch.critSearch'),
    context: marker('advSearch.context'),
    customCol: marker('advSearch.customCol'),
    cleanConf: marker('advSearch.cleanConf'),
    export: marker('advSearch.export'),
    saveFav: marker('advSearch.saveFav'),
    addFilter: marker('advSearch.addFilter'),
    addColumn: marker('advSearch.addColumn'),
    facilities: marker('administration.facilities'),
    workflows: marker('administration.workflows'),
    states: marker('advSearch.states'),
    substates: marker('advSearch.subStates'),
    initDate: marker('advSearch.initDate'),
    endDate: marker('advSearch.endDate'),
    rangeDate: marker('advSearch.rangeDate'),
    search: marker('common.search'),
    selectAll: marker('common.selectAll'),
    unselectAll: marker('common.unselectAll'),
    required: marker('errors.required')
  };
  public isAdmin = false;
  public showDateRangePicker = false;
  public advSearchFav: AdvSearchDTO[] = [];
  public facilityList: FacilityDTO[] = [];
  public workflowList: WorkflowCreateCardDTO[] = [];
  public criteriaOptions: AdvancedSearchOptionsDTO = { cards: {}, entities: {} };
  public columnsOptions: AdvancedSearchOptionsDTO = { cards: {}, entities: {} };
  public statesOptions: Observable<WorkflowStateDTO[] | any[]>;
  public subStatesOptions: Observable<WorkflowSubstateDTO[] | any[]>;
  public advSearchForm: FormGroup;
  public advSearchSelected: AdvSearchDTO;
  public modeDrawer: 'criteria' | 'context' | 'column';
  public escapedValue = '';
  public operators: AdvSearchOperatorDTO[] = [];
  public filterOptions = [
    { id: 1, name: 'Hoy' },
    { id: 2, name: 'Semana en curso' },
    { id: 3, name: 'Última semana' },
    { id: 4, name: 'Mes en curso' },
    { id: 5, name: 'Último mes' },
    { id: 6, name: 'Custom' }
  ];
  constructor(
    private advSearchService: AdvSearchService,
    private facilityService: FacilityService,
    private spinnerService: ProgressSpinnerDialogService,
    private logger: NGXLogger,
    private globalMessageService: GlobalMessageService,
    private confirmationDialog: ConfirmDialogService,
    private fb: FormBuilder,
    private translateService: TranslateService,
    private admService: AuthenticationService,
    private customDialogService: CustomDialogService,
    private authService: AuthenticationService,
    private prepareAndMoveService: WorkflowPrepareAndMoveService
  ) {}
  get context() {
    return (this.advSearchForm.get('advancedSearchContext') as FormGroup).controls;
  }
  get columns(): FormArray {
    return this.advSearchForm.get('advancedSearchCols') as FormArray;
  }
  get criteria(): FormArray {
    return this.advSearchForm.get('advancedSearchItems') as FormArray;
  }

  public contextErrors(): boolean {
    const scheduledReportsValue = this.advSearchForm.get('advancedSearchContext').get('scheduledReports')?.value;
    if (!scheduledReportsValue) {
      return true;
    }
    if (scheduledReportsValue === 6) {
      return (
        !this.advSearchForm.get('advancedSearchContext')?.get('dateCardFrom')?.value ||
        !this.advSearchForm.get('advancedSearchContext')?.get('dateCardTo')?.value
      );
    }
    return false;
  }
  public criteriaErrors(): boolean {
    let error = false;
    this.criteria.controls.reduce((a: boolean, b: FormGroup) => {
      if (!error && this.errorInCriteriaConfig(b)) {
        error = true;
      }
      return error;
    }, false);
    // if (!error && this.criteria.length === 0) {
    //   error = true;
    // }
    return error;
  }

  public onFilterChange(selectedValue: number): void {
    this.showDateRangePicker = selectedValue === 6;
  }

  public runSearch(): void {
    this.setAdvSearchData();
    this.table.executeSearch(this.advSearchSelected);
  }
  public runExport(): void {
    if (!this.hasErrors()) {
      this.confirmationDialog
        .open({
          title: this.translateService.instant(marker('common.warning')),
          message: this.translateService.instant(marker('advSearch.exportConfirmation'))
        })
        .pipe(take(1))
        .subscribe((ok: boolean) => {
          if (ok) {
            this.setAdvSearchData();
            this.advSearchService.newSearchExport$.next(this.advSearchSelected);
          }
        });
    }
  }
  public setAdvSearchData(): void {
    this.advSearchSelected = this.advSearchSelected
      ? this.advSearchSelected
      : {
          id: null,
          name: null,
          userId: null,
          allUsers: true,
          editable: true,
          unionType: 'TYPE_AND',
          advancedSearchItems: [],
          advancedSearchCols: [],
          advancedSearchContext: null
        };
    this.advSearchSelected.advancedSearchItems = this.criteria.getRawValue();
    this.advSearchSelected.advancedSearchCols = this.columns.getRawValue();
    this.advSearchSelected.advancedSearchContext = {};
    const context = this.advSearchForm.get('advancedSearchContext').getRawValue() as AdvancedSearchContext;
    this.advSearchSelected.advancedSearchContext.dateCardFrom = moment(context.dateCardFrom).format('DD/MM/YYYY');
    this.advSearchSelected.advancedSearchContext.dateCardTo = moment(context.dateCardTo).format('DD/MM/YYYY');
    this.advSearchSelected.advancedSearchContext.facilitiesIds = context.facilities.map((f: FacilityDTO) => f.id);
    this.advSearchSelected.advancedSearchContext.workflowsIds = context.workflows.map((f: FacilityDTO) => f.id);
    this.advSearchSelected.advancedSearchContext.statesIds = context.states.map((f: FacilityDTO) => f.id);
    this.advSearchSelected.advancedSearchContext.substatesIds = context.substates.map((f: FacilityDTO) => f.id);
  }
  public changeState(): void {
    const substateList = this.getSubstates();
    this.context.substates.setValue(
      this.context.substates.value.filter((substate: WorkflowSubstateDTO) =>
        substateList.find((subst: WorkflowSubstateDTO) => substate.id === subst.id)
      )
    );
    this.advSearchForm.get('advancedSearchContext').get('filterSubstateForm').setValue('', { emitEvent: true });
  }
  public changeWorkflow(): void {
    const stateList = this.getStates();
    this.context.states.setValue(
      this.context.states.value.filter((state: WorkflowStateDTO) => stateList.find((st: WorkflowStateDTO) => st.id === state.id))
    );
    this.advSearchForm.get('advancedSearchContext').get('filterStateForm').setValue('', { emitEvent: true });
    this.changeState();
  }
  public getSubstates(): WorkflowSubstateDTO[] {
    let substatesAvailables: WorkflowSubstateDTO[] = [];
    if (this.context.workflows.value) {
      this.context.states.value.forEach((wk: WorkflowStateDTO) => {
        substatesAvailables = [...substatesAvailables, ...wk.workflowSubstates];
      });
    }
    return substatesAvailables;
  }
  public getStates(): WorkflowStateDTO[] {
    let statesAvailables: WorkflowStateDTO[] = [];
    if (this.context.workflows.value) {
      this.context.workflows.value.forEach((wk: WorkflowCreateCardDTO) => {
        statesAvailables = [...statesAvailables, ...wk.workflowStates];
      });
    }
    return statesAvailables;
  }
  public selectAll(control: AbstractControl, list: any[]) {
    control.setValue(list);
    this.changeWorkflow();
  }

  public unselectAll(type: 'facilities' | 'workflows' | 'states' | 'substates', control: AbstractControl) {
    control.setValue([]);
    switch (type) {
      case 'workflows':
        this.context.states.setValue([]);
        this.context.substates.setValue([]);
        break;
      case 'states':
        this.context.substates.setValue([]);
        break;
    }
    this.changeWorkflow();
  }

  public hasAllSelected(control: AbstractControl, list: any[]): boolean {
    const actualValue = control.value ? control.value : [];
    return (
      list &&
      haveArraysSameValues(
        actualValue.map((item: any) => (item?.id ? item.id : null)).sort(),
        list.map((item: any) => (item?.id ? item.id : null)).sort()
      )
    );
  }
  cleanFilters(): void {
    this.confirmationDialog
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('advSearch.continueNewSearch'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          this.initForm();
        }
      });
  }
  openFilters(mode: 'criteria' | 'context' | 'column'): void {
    if (!this.drawerCont.opened) {
      this.drawerCont.toggle();
    } else if (this.modeDrawer === mode) {
      this.drawerCont.toggle();
    }
    this.modeDrawer = mode;
  }
  refreshFavSearchList(): void {
    const spinner = this.spinnerService.show();
    this.advSearchService
      .getAdvSearchList()
      .pipe(take(1))
      .subscribe({
        next: (response: AdvSearchDTO[]) => {
          this.advSearchFav = response ? response : [];
          this.spinnerService.hide(spinner);
        },
        error: (error: ConcenetError) => {
          this.spinnerService.hide(spinner);
          this.logger.error(error);
          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
        }
      });
  }
  duplicateFavSearch(advSearch: AdvSearchDTO): void {
    const spinner = this.spinnerService.show();
    this.advSearchService
      .duplicateAdvSearch(advSearch.id)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.spinnerService.hide(spinner);
          this.refreshFavSearchList();
        },
        error: (error: ConcenetError) => {
          this.spinnerService.hide(spinner);
          this.logger.error(error);
          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
        }
      });
  }
  deleteFavSearch(advSearch: AdvSearchDTO): void {
    this.confirmationDialog
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('advSearch.deleteConfirmation'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          const spinner = this.spinnerService.show();
          this.advSearchService
            .deleteAdvSearchById(advSearch.id)
            .pipe(take(1))
            .subscribe({
              next: () => {
                this.spinnerService.hide(spinner);
                this.refreshFavSearchList();
              },
              error: (error: ConcenetError) => {
                this.spinnerService.hide(spinner);
                this.logger.error(error);
                this.globalMessageService.showError({
                  message: error.message,
                  actionText: this.translateService.instant(marker('common.close'))
                });
              }
            });
        }
      });
  }
  getFavSearch(advSearch: AdvSearchDTO, edit?: boolean): void {
    this.confirmationDialog
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('advSearch.continueNewSearch'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          const spinner = this.spinnerService.show();
          this.advSearchService
            .getAdvSearchById(advSearch.id)
            .pipe(take(1))
            .subscribe({
              next: (advSearchDetail) => {
                this.advSearchSelected = advSearchDetail;
                this.initForm(advSearchDetail, edit);
                this.favDrawer.toggle();
                this.spinnerService.hide(spinner);
              },
              error: (error: ConcenetError) => {
                this.spinnerService.hide(spinner);
                this.logger.error(error);
                this.globalMessageService.showError({
                  message: error.message,
                  actionText: this.translateService.instant(marker('common.close'))
                });
              }
            });
        }
      });
  }
  addCriteriaFilter(): void {
    this.customDialogService
      .open({
        component: AdvSearchCriteriaDialogComponent,
        extendedComponentData: {
          options: this.criteriaOptions,
          selected: this.advSearchForm.get('advancedSearchItems').value,
          mode: 'CRITERIA'
        },
        id: AdvSearchCriteriaDialogComponentModalEnum.ID,
        panelClass: AdvSearchCriteriaDialogComponentModalEnum.PANEL_CLASS,
        disableClose: true,
        width: '700px'
      })
      .pipe(take(1))
      .subscribe((data: AdvancedSearchItem[]) => {
        const criteriaItems = this.criteria.getRawValue();
        const currentCriteriaIds = criteriaItems.map((col: AdvancedSearchItem) => this.getColCustomId(col));
        data.forEach((col: AdvancedSearchItem) => {
          const index = currentCriteriaIds.indexOf(this.getColCustomId(col));
          if (index >= 0) {
            //Ya lo tengo dentro del formulario
            currentCriteriaIds.splice(index, 1);
          } else if (index === -1) {
            //No lo tengo en el formulario
            this.addCriteria(col);
          }
        });
        if (currentCriteriaIds.length) {
          this.removeCriteriaOrColFromFormArray(this.criteria, currentCriteriaIds);
        }
      });
  }
  addColumns(): void {
    this.customDialogService
      .open({
        component: AdvSearchCriteriaDialogComponent,
        extendedComponentData: {
          options: this.columnsOptions,
          selected: this.advSearchForm.get('advancedSearchCols').value,
          mode: 'COLUMNS'
        },
        id: AdvSearchCriteriaDialogComponentModalEnum.ID,
        panelClass: AdvSearchCriteriaDialogComponentModalEnum.PANEL_CLASS,
        disableClose: true,
        width: '700px'
      })
      .pipe(take(1))
      .subscribe((data: AdvancedSearchItem[]) => {
        const currentCols = this.columns.getRawValue();
        const currentColdIds = currentCols.map((col: AdvancedSearchItem) => this.getColCustomId(col));
        data.forEach((col: AdvancedSearchItem) => {
          const index = currentColdIds.indexOf(this.getColCustomId(col));
          if (index >= 0) {
            //Ya lo tengo dentro del formulario
            currentColdIds.splice(index, 1);
          } else if (index === -1) {
            //No lo tengo en el formulario
            this.addColumn(col);
          }
        });
        //Dentro de currentColIds debería tener las que quité y por tanto tengo que quitar del formulario
        if (currentColdIds.length) {
          this.removeCriteriaOrColFromFormArray(this.columns, currentColdIds);
        }
      });
  }
  addColumn(value: AdvancedSearchItem): void {
    if (this.columns) {
      this.columns.push(
        this.fb.group({
          id: [value.id ? value.id : null],
          advancedSearchId: [
            value.advancedSearchId ? value.advancedSearchId : this.advSearchForm.value.id ? this.advSearchForm.value.id : null
          ],
          tabItem: [value.tabItem ? value.tabItem : null],
          variable: [value.variable ? value.variable : null],
          orderNumber: [this.columns.length + 1]
        })
      );
    }
  }
  addCriteria(value: AdvancedSearchItem): void {
    if (this.criteria) {
      this.criteria.push(
        this.fb.group({
          id: [value.id ? value.id : null],
          advancedSearchId: [
            value.advancedSearchId ? value.advancedSearchId : this.advSearchForm.value.id ? this.advSearchForm.value.id : null
          ],
          tabItem: [value.tabItem ? value.tabItem : null],
          variable: [value.variable ? value.variable : null],
          orderNumber: [value.orderNumber ? value.orderNumber : this.criteria.length + 1],
          advancedSearchOperator: [value.advancedSearchOperator ? value.advancedSearchOperator : null],
          value: [value.value ? value.value : null]
        })
      );
    }
  }
  removeCriteriaOrColFromFormArray = (formArray: FormArray, ids: string[]): void => {
    const nextId = ids.shift();
    const control = formArray.controls.find((col: FormGroup) => this.getColCustomId(col.value) === nextId);
    removeItemInFormArray(formArray, control.value.orderNumber - 1);
    //Verificar y corregir los ordeNumbers de los elementos restantes
    formArray.controls.forEach((col: FormGroup, index: number) => {
      col.get('orderNumber').setValue(index + 1);
    });
    if (ids.length) {
      this.removeCriteriaOrColFromFormArray(formArray, ids);
    }
  };
  getColCustomId(col: AdvancedSearchItem): string {
    if (col.tabItem) {
      return `tabItem-${col.tabItem.id}`;
    } else {
      return `variable-${col.variable.id}`;
    }
  }
  getColName(col: FormGroup): string {
    if (col.value.tabItem) {
      return col.value.tabItem.name;
    } else {
      return col.value.variable.name;
    }
  }
  getCriteriaInfo(criteria: FormGroup): string {
    // console.log(criteria.value);
    const criteriaValue = criteria.value as AdvancedSearchItem;
    let value = '';
    if (
      `${criteriaValue.value}`?.indexOf(this.escapedValue) >= 0 ||
      criteriaValue.advancedSearchOperator.code === 'IN' ||
      criteriaValue.advancedSearchOperator.code === 'NIN' ||
      criteriaValue.advancedSearchOperator.code === 'BET'
    ) {
      if (criteriaValue.advancedSearchOperator.code === 'BET') {
        value = this.translateService.instant(marker('advSearch.itemsBetween'), {
          from: criteriaValue.value.split(this.escapedValue)[0],
          to: criteriaValue.value.split(this.escapedValue)[1]
        });
      } else {
        value = this.translateService.instant(marker('advSearch.itemsInArray'), {
          num: criteriaValue.value.split(this.escapedValue).length
        });
      }
    } else if (
      criteriaValue.tabItem?.typeItem === 'LIST' ||
      criteriaValue.variable?.dataType === 'ENTITY' ||
      (criteriaValue.value && typeof criteriaValue.value === 'object')
    ) {
      value = this.translateService.instant(marker('advSearch.optionSelected'));
    } else {
      value = criteriaValue.value;
    }
    if (criteriaValue.advancedSearchOperator?.name && value) {
      return `${criteriaValue.advancedSearchOperator.name} ${value}`;
    } else if (criteriaValue.advancedSearchOperator?.name) {
      return criteriaValue.advancedSearchOperator.name;
    }
  }
  errorInCriteriaConfig(criteria: FormGroup): string {
    const criteriaValue = criteria.value as AdvancedSearchItem;
    if (
      !criteriaValue.advancedSearchOperator ||
      (!criteriaValue?.value &&
        criteriaValue.advancedSearchOperator.code !== 'ISNULL' &&
        criteriaValue.advancedSearchOperator.code !== 'NOTISNULL')
    ) {
      return this.translateService.instant(marker('advSearch.criteriaWithoutConfig'));
    }
    return null;
  }

  drop(event: CdkDragDrop<string[]>, list: 'columns' | 'criteria') {
    if (list === 'columns') {
      moveItemInFormArray(this.columns, event.previousIndex, event.currentIndex);
    } else {
      moveItemInFormArray(this.criteria, event.previousIndex, event.currentIndex);
    }
  }
  deleteColumn(col: FormGroup) {
    this.confirmationDialog
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('advSearch.deleteColumnConfirmation'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          removeItemInFormArray(this.columns, col.value.orderNumber - 1);
        }
      });
  }
  deleteCriteria(col: FormGroup) {
    this.confirmationDialog
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('advSearch.deleteCriteriaConfirmation'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          removeItemInFormArray(this.criteria, col.value.orderNumber - 1);
        }
      });
  }
  editCriteria(criteria: FormGroup) {
    this.customDialogService
      .open({
        component: AdvSearchCriteriaEditionDialogComponent,
        extendedComponentData: { operators: this.operators, criteria, escapedValue: this.escapedValue },
        id: AdvSearchCriteriaEditionDialogComponentModalEnum.ID,
        panelClass: AdvSearchCriteriaEditionDialogComponentModalEnum.PANEL_CLASS,
        disableClose: true,
        width: '700px'
      })
      .pipe(take(1))
      .subscribe((data: any) => {
        if (data) {
          criteria.get('advancedSearchOperator').setValue(data.operator);
          const value = Array.isArray(data.value)
            ? data.value.map((i: any) => (i?.id ? i.id : i)).join(this.escapedValue)
            : data.value;
          criteria.get('value').setValue(value);
        }
      });
  }
  hasErrors(): boolean {
    return !this.columns.length || this.criteriaErrors() || this.contextErrors();
  }
  saveFav(): void {
    this.customDialogService
      .open({
        component: AdvSearchSaveFavDialogComponent,
        extendedComponentData: { advSearchForm: this.advSearchForm, isAdmin: this.isAdmin },
        id: AdvSearchSaveFavDialogComponentModalEnum.ID,
        panelClass: AdvSearchSaveFavDialogComponentModalEnum.PANEL_CLASS,
        disableClose: true,
        width: '700px'
      })
      .pipe(take(1))
      .subscribe((data: AdvSearchDTO) => {
        if (data) {
          this.initForm(data);
          this.refreshFavSearchList();
        }
      });
  }
  ngOnInit(): void {
    this.isAdmin = this.authService.getUserPermissions().find((permission) => permission.code === PermissionConstants.ISADMIN)
      ? true
      : false;
    const spinner = this.spinnerService.show();
    const resquests = [
      this.advSearchService.getAdvSearchList().pipe(take(1)),
      this.facilityService.getFacilitiesByBrandsIds().pipe(take(1)),
      this.advSearchService.getWorkflowList().pipe(take(1)),
      this.advSearchService.getCriteria().pipe(take(1)),
      this.advSearchService.getColumns().pipe(take(1)),
      this.advSearchService.getAdvSearchOperators().pipe(take(1))
    ];
    forkJoin(resquests).subscribe({
      next: (
        responses: [
          AdvSearchDTO[],
          FacilityDTO[],
          WorkflowCreateCardDTO[],
          AdvancedSearchOptionsDTO,
          AdvancedSearchOptionsDTO,
          AdvSearchOperatorDTO[]
        ]
      ) => {
        this.advSearchFav = responses[0] ? responses[0] : [];
        this.facilityList = responses[1] ? responses[1] : [];
        this.workflowList = responses[2] ? responses[2] : [];
        this.escapedValue = responses[3]?.escapedValue ? responses[3].escapedValue : '';
        this.criteriaOptions = responses[3] ? responses[3] : { cards: {}, entities: {} };
        this.columnsOptions = responses[4] ? responses[4] : { cards: {}, entities: {} };
        this.operators = responses[5] ? responses[5] : [];
        this.workflowList = this.workflowList.map((wk: WorkflowCreateCardDTO) => {
          wk.workflowStates = wk.workflowStates.map((ws: WorkflowStateDTO) => {
            const workflowCopy = _.cloneDeep(wk); //Rompo la recursividad
            workflowCopy.workflowStates = [];
            ws.workflow = workflowCopy;
            ws.workflowSubstates = ws.workflowSubstates.map((wss: WorkflowSubstateDTO) => {
              const stateCopy = _.cloneDeep(ws);
              stateCopy.workflowSubstates = [];
              wss.workflowState = stateCopy;
              return wss;
            });
            return ws;
          });
          return wk;
        });
        this.initForm();
        this.spinnerService.hide(spinner);
      },
      error: (error: ConcenetError) => {
        this.spinnerService.hide(spinner);
        this.logger.error(error);
        this.globalMessageService.showError({
          message: error.message,
          actionText: this.translateService.instant(marker('common.close'))
        });
      }
    });
  }
  private initForm(advSearch?: AdvSearchDTO, edit?: boolean) {
    this.advSearchForm = this.fb.group({
      id: [advSearch?.id ? advSearch.id : null],
      name: [advSearch?.name ? advSearch.name : null, [Validators.required]],
      unionType: [advSearch?.unionType ? advSearch.unionType : 'TYPE_AND'],
      userId: [advSearch?.userId ? advSearch.userId : this.admService.getUserId()],
      allUsers: [advSearch?.allUsers ? advSearch.allUsers : false],
      scheduledQueries: [advSearch?.scheduledQueries ? advSearch.scheduledQueries : null],
      typeDate: [advSearch?.typeDate ? advSearch.typeDate : null],
      listEmails: [advSearch?.listEmails ? advSearch.listEmails : null, EmailValidator.validate],
      queryMark: [advSearch?.queryMark ? advSearch.queryMark : false],
      editable: [advSearch?.editable === false ? advSearch.editable : true],
      advancedSearchContext: this.fb.group({
        facilities: [[]],
        workflows: [[]],
        states: [[]],
        substates: [[]],
        dateCardFrom: [null, Validators.required],
        dateCardTo: [null, Validators.required],
        scheduledReports: [''],
        filterStateForm: [''],
        filterSubstateForm: ['']
      }),
      advancedSearchItems: this.fb.array([]),
      advancedSearchCols: this.fb.array([])
    });
    this.initListeners();
    if (advSearch) {
      if (advSearch.advancedSearchContext) {
        if (advSearch.advancedSearchContext.dateCardFrom) {
          this.context.dateCardFrom.setValue(moment(advSearch.advancedSearchContext.dateCardFrom, 'DD-MM-YYYY').toDate());
        }
        if (advSearch.advancedSearchContext.dateCardTo) {
          this.context.dateCardTo.setValue(moment(advSearch.advancedSearchContext.dateCardTo, 'DD-MM-YYYY').toDate());
        }
        if (advSearch.advancedSearchContext.facilitiesIds) {
          this.context.facilities.setValue(
            advSearch.advancedSearchContext.facilitiesIds
              .map((idFac: number) => this.facilityList.find((fac: FacilityDTO) => fac.id === idFac))
              .filter((fac: FacilityDTO) => !!fac)
          );
        }
        if (advSearch.advancedSearchContext.workflowsIds) {
          this.context.workflows.setValue(
            advSearch.advancedSearchContext.workflowsIds
              .map((idWor: number) => this.workflowList.find((wor: WorkflowCreateCardDTO) => wor.id === idWor))
              .filter((wor: WorkflowCreateCardDTO) => !!wor)
          );
        }
        if (advSearch.advancedSearchContext.statesIds) {
          const stateList = this.getStates();
          this.context.states.setValue(
            advSearch.advancedSearchContext.statesIds
              .map((idSta: number) => stateList.find((sta: WorkflowStateDTO) => sta.id === idSta))
              .filter((sta: WorkflowStateDTO) => !!sta)
          );
        }
        if (advSearch.advancedSearchContext.substatesIds) {
          const substateList = this.getSubstates();
          this.context.substates.setValue(
            advSearch.advancedSearchContext.substatesIds
              .map((idSub: number) => substateList.find((sub: WorkflowSubstateDTO) => sub.id === idSub))
              .filter((sub: WorkflowSubstateDTO) => !!sub)
          );
        }
      }
      if (advSearch.advancedSearchCols) {
        advSearch.advancedSearchCols = _.sortBy(advSearch.advancedSearchCols, ['orderNumber']);
        _.forEach(advSearch.advancedSearchCols, (value) => {
          this.addColumn(value);
        });
      }
      if (advSearch.advancedSearchItems) {
        advSearch.advancedSearchItems = _.sortBy(advSearch.advancedSearchItems, ['orderNumber']);
        _.forEach(advSearch.advancedSearchItems, (value) => {
          this.addCriteria(value);
        });
      }
    }
    this.changeWorkflow();
  }
  private initListeners(): void {
    this.statesOptions = this.advSearchForm
      .get('advancedSearchContext')
      .get('filterStateForm')
      ?.valueChanges.pipe(
        untilDestroyed(this),
        startWith(''),
        map((value) => this.filter('states', value || ''))
      );

    this.subStatesOptions = this.advSearchForm
      .get('advancedSearchContext')
      .get('filterSubstateForm')
      ?.valueChanges.pipe(
        untilDestroyed(this),
        startWith(''),
        map((value) => this.filter('subStates', value || ''))
      );
    this.prepareAndMoveService.reloadData$
      .pipe(untilDestroyed(this))
      .subscribe((data: 'MOVES_IN_THIS_WORKFLOW' | 'MOVES_IN_OTHER_WORKFLOWS' | 'UPDATE_INFORMATION') => {
        if (data === 'MOVES_IN_THIS_WORKFLOW' || data === 'MOVES_IN_OTHER_WORKFLOWS' || data === 'UPDATE_INFORMATION') {
          this.prepareAndMoveService.reloadData$.next(null);
        }
      });
  }
  private filter = (from: 'states' | 'subStates', value: string): any[] => {
    const filterValue = `${value}`.toLowerCase().trim();
    let options: any[] = [];
    switch (from) {
      case 'states':
        options = this.getStates() as WorkflowStateDTO[];
        return options.filter((state: any) =>
          (state.workflow.name + ' - ' + state.name).toLowerCase().trim().includes(filterValue)
        );
      case 'subStates':
        options = this.getSubstates() as WorkflowSubstateDTO[];
        return options.filter((substate: any) =>
          (substate.workflowState.workflow.name + ' - ' + substate.workflowState.name + ' - ' + substate.name)
            .toLowerCase()
            .trim()
            .includes(filterValue)
        );
    }
  };
}
