import { Component, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatMenuTrigger } from '@angular/material/menu';
import { ActivatedRoute } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import PaginationResponseI from '@data/interfaces/pagination-response';
import WorkflowCardDTO from '@data/models/workflows/workflow-card-dto';
import { TypeFilterCard } from '@data/models/workflows/workflow-card-instance-dto';
import WorkflowDTO from '@data/models/workflows/workflow-dto';
import { WorkflowsService } from '@data/services/workflows.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { Observable } from 'rxjs';
import { finalize, map, startWith, take } from 'rxjs/operators';
@UntilDestroy()
@Component({
  selector: 'app-workflow-card-searcher',
  templateUrl: './workflow-card-searcher.component.html',
  styleUrls: ['./workflow-card-searcher.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class WorkflowCardSearcherComponent implements OnInit {
  @Input() format: 'icon' | 'input';

  @ViewChild(MatMenuTrigger) filterMenuTrigger!: MatMenuTrigger;

  DEFAULT_ATTRIBUTE = TypeFilterCard[4];
  SESSION_FAST_SEARCHER_ATTR_KEY = 'userFastSearchAttrPreference';
  SESSION_FAST_SEARCHER_WF_KEY = 'userFastSearchWfPreference';
  MIN_SEARCH_LENGTH = 4;

  public labels: { [key: string]: string } = {
    search: marker('common.search'),
    attr: marker('workflow-card-searcher.attr'),
    VEHICLE_LICENSE_PLATE: marker('workflow-card-searcher.VEHICLE_LICENSE_PLATE'),
    VEHICLE_VIN: marker('workflow-card-searcher.VEHICLE_VIN'),
    CUSTOMER_SOCIAL_ID: marker('workflow-card-searcher.CUSTOMER_SOCIAL_ID'),
    CUSTOMER_FULL_NAME: marker('workflow-card-searcher.CUSTOMER_FULL_NAME'),
    REPAIR_ORDER_REFERENCE: marker('workflow-card-searcher.REPAIR_ORDER_REFERENCE'),
    REPAIR_ORDER_ID: marker('workflow-card-searcher.REPAIR_ORDER_ID'),
    INVENTORY_COMMISSION_NUMBER: marker('workflow-card-searcher.INVENTORY_COMMISSION_NUMBER'),
    CARD_TAG_1: marker('workflow-card-searcher.CARD_TAG_1'),
    CARD_TAG_2: marker('workflow-card-searcher.CARD_TAG_2'),
    CARD_TAG_3: marker('workflow-card-searcher.CARD_TAG_3'),
    workflow: marker('common.workflows'),
    error_attribute: marker('workflow-card-searcher.error_attribute'),
    error_workflow: marker('workflow-card-searcher.error_workflow'),
    error_search_length: marker('workflow-card-searcher.error_search_length'),
    filterWorkflow: marker('workflows.filter'),
    anyOption: marker('common.anyOption')
  };

  public idWfRouteSelected: number = null;
  public workflowList: WorkflowDTO[] = null;
  public workflowOptions: Observable<WorkflowDTO[]>;
  public workflowSelected: WorkflowDTO;

  attributes: string[] = TypeFilterCard;

  public lastSearch: string[] = [];
  public searching = 0;
  public filterValue: string;
  public searcherForm: UntypedFormGroup;
  public filterForm: UntypedFormGroup;
  public cards: WorkflowCardDTO[] = [];
  public searchValidationsErrors: string[] = [];
  public fastSearcherUserPreferences: {
    attribute: string;
    workflow: number;
  } = undefined;
  public paginationConfig = {
    length: 10,
    pageSize: 10,
    page: 0,
    totalPages: 0,
    first: true,
    last: false
  };

  constructor(
    private fb: FormBuilder,
    private workflowService: WorkflowsService,
    private route: ActivatedRoute,
    private spinnerService: ProgressSpinnerDialogService,
    private globalMessageService: GlobalMessageService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    if (this.route?.snapshot?.params?.wId) {
      this.idWfRouteSelected = parseInt(this.route.snapshot.params.wId, 10);
    }
    this.getFastSearcherUserPreferences();
    this.getInitData();
    this.initForm();
    this.searcherForm
      .get('search')
      .valueChanges.pipe(untilDestroyed(this))
      .subscribe((value) => {
        this.cards = [];
        this.checkValidations();
        this.openFilterMenu();
      });
  }

  public openFilterMenu() {
    if (!this.filterMenuTrigger.menuOpen) {
      this.filterMenuTrigger.openMenu();
    }
  }

  public initForm(): void {
    this.searcherForm = this.fb.group({
      search: [null]
    });
    this.filterForm = this.fb.group({
      attribute: [this.fastSearcherUserPreferences.attribute],
      workflow: [this.fastSearcherUserPreferences.workflow],
      workflowSearch: ['']
    });
  }

  public cardSelected(card: WorkflowCardDTO): void {
    setTimeout(() => this.filterMenuTrigger.closeMenu());
    this.searcherForm.get('search').setValue(null);
    this.cards = [];
  }

  public getDateToShow(card: WorkflowCardDTO) {
    if (card.cardInstanceWorkflows[0]?.dateAppliTimeLimit) {
      return card.cardInstanceWorkflows[0]?.dateAppliTimeLimit;
    }
  }

  public showWorkflowName(index: number): boolean {
    if (this.cards?.length && index > 0) {
      const prevCard = this.cards[index - 1];
      const actualCard = this.cards[index];
      if (prevCard.cardInstanceWorkflows[0].workflowId === actualCard.cardInstanceWorkflows[0].workflowId) {
        return false;
      }
    }
    return true;
  }

  public showWorkflowSubstate(index: number): boolean {
    if (this.cards?.length && index > 0) {
      const prevCard = this.cards[index - 1];
      const actualCard = this.cards[index];
      if (
        prevCard.cardInstanceWorkflows[0].workflowId === actualCard.cardInstanceWorkflows[0].workflowId &&
        prevCard.cardInstanceWorkflows[0].workflowSubstateName === actualCard.cardInstanceWorkflows[0].workflowSubstateName
      ) {
        return false;
      }
    }
    return true;
  }

  public onScroll(): void {
    if (!this.paginationConfig.last && this.paginationConfig.page < this.paginationConfig.totalPages) {
      this.searching++;
      this.paginationConfig.page++;
      this.fetchData();
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public selectorChange(value?: any): void {
    this.checkValidations();
    this.setFastSearcherUserPreferences();
  }

  public getWorkflowLabel(w?: WorkflowDTO, mainLabel?: boolean): string {
    const workflow: WorkflowDTO = w ? w : this.filterForm.get('workflow').value();
    if (workflow && workflow.name) {
      return `${workflow.name}`;
    } else {
      return this.translateService.instant(this.labels.anyOption);
    }
  }

  public filter(value?: string) {
    this.openFilterMenu();
    value = value ? value : this.searcherForm.get('search')?.value;
    this.checkValidations();
    if (this.searchValidationsErrors.length > 0) {
      return;
    }
    this.filterValue = value && typeof value === 'string' ? value.toString().toLowerCase() : '';
    if (this.lastSearch.length === 0) {
      this.searching++;
      this.paginationConfig.page = 0;
      this.fetchData();
    }
    this.lastSearch.push(value);
  }

  private checkValidations(): void {
    const value = this.searcherForm.get('search')?.value;
    const attr = this.filterForm.get('attribute')?.value;
    this.searchValidationsErrors = [];
    if (!value || value.length < this.MIN_SEARCH_LENGTH) {
      this.searchValidationsErrors.push(this.labels.error_search_length);
    }
    if (!attr) {
      this.searchValidationsErrors.push(this.labels.error_attribute);
    }
  }

  private fetchData() {
    const attr = this.filterForm.get('attribute')?.value;
    const wId = this.filterForm.get('workflow')?.value?.id ? this.filterForm.get('workflow')?.value?.id : null;
    this.workflowService
      .searchCardsInWorkflowsPaged(this.filterValue, attr, wId, this.paginationConfig)
      .pipe(
        take(1),
        finalize(() => {
          this.searching--;
          if (this.lastSearch.length >= 1) {
            this.searching++;
            this.paginationConfig.page = 0;
            this.fetchData();
          }
          this.lastSearch = [];
        })
      )
      .subscribe((data: PaginationResponseI<WorkflowCardDTO>) => {
        if (data) {
          this.paginationConfig.length = data.totalElements;
          this.paginationConfig.first = data.first;
          this.paginationConfig.last = data.last;
          this.paginationConfig.page = data.number;
          this.paginationConfig.totalPages = data.totalPages;
          this.paginationConfig.first = data.first;
          if (data.first) {
            this.cards = [];
          }
          this.cards = [...this.cards, ...data.content];
        } else {
          this.cards = [];
        }
        this.setFastSearcherUserPreferences();
      });
  }

  private getInitData(): void {
    const spinner = this.spinnerService.show();
    this.workflowService
      .getWorkflowsList()
      .pipe(take(1))
      .subscribe(
        (data) => {
          let workflowSelectedByIdParam: WorkflowDTO = null;
          data?.forEach((workflow: WorkflowDTO) => {
            if (workflow.id === this.fastSearcherUserPreferences.workflow) {
              workflowSelectedByIdParam = workflow;
            }
          });
          this.workflowList = data ? data : [];
          this.workflowOptions = this.filterForm.get('workflowSearch')?.valueChanges.pipe(
            startWith(''),
            map((value) => this.filterWorkflow(value || ''))
          );
          if (workflowSelectedByIdParam) {
            this.filterForm.get('workflow').setValue(workflowSelectedByIdParam);
            this.workflowSelected = workflowSelectedByIdParam;
          }
          this.spinnerService.hide(spinner);
        },
        (error) => {
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

  private setFastSearcherUserPreferences(): void {
    sessionStorage.setItem(
      this.SESSION_FAST_SEARCHER_ATTR_KEY,
      this.filterForm.get('attribute').value ? this.filterForm.get('attribute').value : this.DEFAULT_ATTRIBUTE
    );
    sessionStorage.setItem(
      this.SESSION_FAST_SEARCHER_WF_KEY,
      this.filterForm.get('workflow').value?.id ? this.filterForm.get('workflow').value.id.toString() : ''
    );
  }

  private getFastSearcherUserPreferences(): void {
    this.fastSearcherUserPreferences = {
      attribute:
        sessionStorage.getItem(this.SESSION_FAST_SEARCHER_ATTR_KEY) &&
        this.attributes.includes(sessionStorage.getItem(this.SESSION_FAST_SEARCHER_ATTR_KEY))
          ? this.attributes.find((attr) => attr === sessionStorage.getItem(this.SESSION_FAST_SEARCHER_ATTR_KEY))
          : this.DEFAULT_ATTRIBUTE,
      workflow:
        sessionStorage.getItem(this.SESSION_FAST_SEARCHER_WF_KEY) &&
        !isNaN(parseInt(sessionStorage.getItem(this.SESSION_FAST_SEARCHER_WF_KEY), 10))
          ? parseInt(sessionStorage.getItem(this.SESSION_FAST_SEARCHER_WF_KEY), 10)
          : this.idWfRouteSelected
          ? this.idWfRouteSelected
          : null
    };
  }
}
