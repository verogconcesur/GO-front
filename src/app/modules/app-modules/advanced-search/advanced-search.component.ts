/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import AdvSearchDTO, { AdvancedSearchItem } from '@data/models/adv-search/adv-search-dto';
import { AdvSearchService } from '@data/services/adv-search.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { Observable, forkJoin, map, startWith, take } from 'rxjs';
import { AdvSearchCardTableComponent } from './components/adv-search-card-table/adv-search-card-table.component';
import { NGXLogger } from 'ngx-logger';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { TranslateService } from '@ngx-translate/core';
import { MatDrawer } from '@angular/material/sidenav';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import FacilityDTO from '@data/models/organization/facility-dto';
import { FacilityService } from '@data/services/facility.sevice';
import WorkflowCreateCardDTO from '@data/models/workflows/workflow-create-card-dto';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '@app/security/authentication.service';
import { haveArraysSameValues } from '@shared/utils/array-comparation-function';
import WorkflowStateDTO from '@data/models/workflows/workflow-state-dto';
import WorkflowSubstateDTO from '@data/models/workflows/workflow-substate-dto';
import _ from 'lodash';
import moment from 'moment';
import AdvancedSearchOptionsDTO from '@data/models/adv-search/adv-search-options-dto';
import { CustomDialogService } from '@jenga/custom-dialog';
import {
  AdvSearchCriteriaDialogComponent,
  AdvSearchCriteriaDialogComponentModalEnum
} from './components/adv-search-criteria-dialog/adv-search-criteria-dialog.component';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { moveItemInFormArray } from '@shared/utils/moveItemInFormArray';
import { removeItemInFormArray } from '@shared/utils/removeItemInFormArray';

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
    search: marker('common.search'),
    selectAll: marker('common.selectAll'),
    unselectAll: marker('common.unselectAll'),
    required: marker('errors.required')
  };
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
    private customDialogService: CustomDialogService
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
  public runSearch(): void {
    this.advSearchSelected.advancedSearchCols = this.columns.getRawValue();
    this.table.executeSearch(this.advSearchSelected);
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
        extendedComponentData: { options: this.criteriaOptions, selected: this.advSearchForm.get('advancedSearchItems').value },
        id: AdvSearchCriteriaDialogComponentModalEnum.ID,
        panelClass: AdvSearchCriteriaDialogComponentModalEnum.PANEL_CLASS,
        disableClose: true,
        width: '700px'
      })
      .pipe(take(1))
      .subscribe((data: AdvancedSearchItem[]) => {
        const criteriaItems = this.criteria.getRawValue();
        data = data.filter((elem: AdvancedSearchItem) => {
          if (elem.tabItem) {
            return !criteriaItems.find((item: AdvancedSearchItem) => item.tabItem && item.tabItem.id === elem.tabItem.id);
          } else {
            return !criteriaItems.find((item: AdvancedSearchItem) => item.variable && item.variable.id === elem.variable.id);
          }
        });
        _.forEach(data, (value) => {
          this.addCriteria(value);
        });
      });
  }
  addColumns(): void {
    this.customDialogService
      .open({
        component: AdvSearchCriteriaDialogComponent,
        extendedComponentData: { options: this.columnsOptions, selected: this.advSearchForm.get('advancedSearchCols').value },
        id: AdvSearchCriteriaDialogComponentModalEnum.ID,
        panelClass: AdvSearchCriteriaDialogComponentModalEnum.PANEL_CLASS,
        disableClose: true,
        width: '700px'
      })
      .pipe(take(1))
      .subscribe((data: AdvancedSearchItem[]) => {
        const currentCols = this.columns.getRawValue();
        data = data.filter((elem: AdvancedSearchItem) => {
          if (elem.tabItem) {
            return !currentCols.find((col: AdvancedSearchItem) => col.tabItem && col.tabItem.id === elem.tabItem.id);
          } else {
            return !currentCols.find((col: AdvancedSearchItem) => col.variable && col.variable.id === elem.variable.id);
          }
        });
        _.forEach(data, (value) => {
          this.addColumn(value);
        });
      });
  }
  addColumn(value: AdvancedSearchItem): void {
    if (this.columns) {
      this.columns.push(
        this.fb.group({
          id: [value.id ? value.id : null],
          advancedSearchId: [this.advSearchForm.value.id ? this.advSearchForm.value.id : null],
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
          advancedSearchId: [this.advSearchForm.value.id ? this.advSearchForm.value.id : null],
          tabItem: [value.tabItem ? value.tabItem : null],
          variable: [value.variable ? value.variable : null],
          orderNumber: [this.columns.length + 1]
        })
      );
      console.log(this.criteria.value);
    }
  }
  getColName(col: FormGroup): string {
    if (col.value.tabItem) {
      return col.value.tabItem.name;
    } else {
      return col.value.variable.name;
    }
  }
  drop(event: CdkDragDrop<string[]>) {
    moveItemInFormArray(this.columns, event.previousIndex, event.currentIndex);
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
  ngOnInit(): void {
    const spinner = this.spinnerService.show();
    const resquests = [
      this.advSearchService.getAdvSearchList().pipe(take(1)),
      this.facilityService.getFacilitiesByBrandsIds().pipe(take(1)),
      this.advSearchService.getWorkflowList().pipe(take(1)),
      this.advSearchService.getCriteria().pipe(take(1)),
      this.advSearchService.getColumns().pipe(take(1))
    ];
    forkJoin(resquests).subscribe({
      next: (
        responses: [AdvSearchDTO[], FacilityDTO[], WorkflowCreateCardDTO[], AdvancedSearchOptionsDTO, AdvancedSearchOptionsDTO]
      ) => {
        this.advSearchFav = responses[0] ? responses[0] : [];
        this.facilityList = responses[1] ? responses[1] : [];
        this.workflowList = responses[2] ? responses[2] : [];
        this.escapedValue = responses[3]?.escapedValue ? responses[3].escapedValue : '';
        this.criteriaOptions = responses[3] ? responses[3] : { cards: {}, entities: {} };
        this.columnsOptions = responses[4] ? responses[4] : { cards: {}, entities: {} };
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
      id: [],
      name: [],
      unionType: ['TYPE_AND'],
      userId: [this.admService.getUserId()],
      advancedSearchContext: this.fb.group({
        facilities: [[]],
        workflows: [[]],
        states: [[]],
        substates: [[]],
        dateCardFrom: [new Date(), Validators.required],
        dateCardTo: [new Date(), Validators.required],
        filterStateForm: [''],
        filterSubstateForm: ['']
      }),
      advancedSearchItems: this.fb.array([]),
      advancedSearchCols: this.fb.array([])
    });
    this.initListeners();
    if (advSearch) {
      if (advSearch.advancedSearchContext) {
        this.context.dateCardFrom.setValue(moment(advSearch.advancedSearchContext.dateCardFrom, 'DD-MM-YYYY').toDate());
        this.context.dateCardTo.setValue(moment(advSearch.advancedSearchContext.dateCardTo, 'DD-MM-YYYY').toDate());
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

    this.subStatesOptions = this.subStatesOptions = this.advSearchForm
      .get('advancedSearchContext')
      .get('filterSubstateForm')
      ?.valueChanges.pipe(
        untilDestroyed(this),
        startWith(''),
        map((value) => this.filter('subStates', value || ''))
      );
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
