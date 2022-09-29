import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CardColumnTabDTO from '@data/models/cards/card-column-tab-dto';
import CardHistoryDTO from '@data/models/cards/card-history';
import CardHistoryFilterDTO from '@data/models/cards/card-history-filter';
import { CardHistoryService } from '@data/services/card-history.service';
import { TranslateService } from '@ngx-translate/core';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-workflow-column-prefixed-history',
  templateUrl: './workflow-column-prefixed-history.component.html',
  styleUrls: ['./workflow-column-prefixed-history.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class WorkflowColumnPrefixedHistoryComponent implements OnInit, OnChanges {
  @Input() tab: CardColumnTabDTO = null;
  @Output() setShowLoading: EventEmitter<boolean> = new EventEmitter(false);

  public labels = {
    eventHistoryTypes: marker('cards.eventHistoryTypes'),
    workflows: marker('cards.workflows'),
    from: marker('common.from'),
    to: marker('common.to'),
    noDataToShow: marker('errors.noDataToShow')
  };
  public historyOriginalData: CardHistoryDTO[] = [];
  public historyData: CardHistoryDTO[] = [];
  public historyFilter: CardHistoryFilterDTO = null;
  public historyFilterOptions: {
    dateEvent: { min: Date; max: Date };
    eventHistoryTypes: { key: string; label: string }[];
    workflows: {
      id: number;
      name: string;
      status: string;
    }[];
  } = {
    dateEvent: { min: null, max: null },
    eventHistoryTypes: [],
    workflows: []
  };
  public historyFilterForm: UntypedFormGroup;
  public dataLoaded = false;

  constructor(
    private cardHistoryService: CardHistoryService,
    private route: ActivatedRoute,
    private globalMessageService: GlobalMessageService,
    private translateService: TranslateService,
    private formBuilder: UntypedFormBuilder
  ) {}

  ngOnInit(): void {
    this.initForms();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.tab) {
      this.historyData = [];
      this.historyOriginalData = [];
      this.historyFilter = {
        cardInstanceWorkflowId: parseInt(this.route?.snapshot?.params?.idCard, 10)
      };
      this.getData();
    }
  }

  public getData(): void {
    if (this.historyFilter.cardInstanceWorkflowId) {
      this.setShowLoading.emit(true);
      this.cardHistoryService
        .getCardHistory(this.historyFilter)
        .pipe(take(1))
        .subscribe(
          (data) => {
            data = data ? data : [];
            this.dataLoaded = true;
            if (data.length) {
              data[0].initial = true;
              data[data.length - 1].final = true;
            }
            this.historyOriginalData = data;
            this.historyData = data;
            this.getFilterOptions();
            this.setShowLoading.emit(false);
          },
          (error: ConcenetError) => {
            this.setShowLoading.emit(false);
            console.log(error);
            this.dataLoaded = true;
            this.globalMessageService.showError({
              message: error.message,
              actionText: this.translateService.instant(marker('common.close'))
            });
          }
        );
    }
  }

  public filterChange(): void {
    const filter = this.historyFilterForm.value;
    let dataToShow = [...this.historyOriginalData];
    if (filter.eventHistoryTypes?.length) {
      const types = [...filter.eventHistoryTypes].map((type) => type.key);
      dataToShow = dataToShow.filter((item: CardHistoryDTO) => types.indexOf(item.eventHistoryType) >= 0);
    }
    if (filter.workflows?.length) {
      const workflows = [...filter.workflows].map((w) => w.id);
      dataToShow = dataToShow.filter((item: CardHistoryDTO) => workflows.indexOf(item.workflow.id) >= 0);
    }
    if (filter.dateEventFrom) {
      dataToShow = dataToShow.filter((item: CardHistoryDTO) => item.dateEvent >= +filter.dateEventFrom);
    }
    if (filter.dateEventTo) {
      dataToShow = dataToShow.filter(
        (item: CardHistoryDTO) =>
          item.dateEvent <=
          +new Date(filter.dateEventTo.getFullYear(), filter.dateEventTo.getMonth(), filter.dateEventTo.getDate(), 23, 59, 59)
      );
    }
    this.historyData = dataToShow;
  }

  public clearFilterData(): void {
    if (this.historyFilterForm.get('dateEventFrom').value) {
      this.historyFilterForm.get('dateEventFrom').setValue(null);
    }
    if (this.historyFilterForm.get('dateEventTo').value) {
      this.historyFilterForm.get('dateEventTo').setValue(null);
    }
    if (this.historyFilterForm.get('eventHistoryTypes').value.length) {
      this.historyFilterForm.get('eventHistoryTypes').setValue([]);
    }
    if (this.historyFilterForm.get('workflows').value.length) {
      this.historyFilterForm.get('workflows').setValue([]);
    }
    this.filterChange();
  }

  public hasData(option: 'eventHistoryTypes' | 'workflows' | 'dateEventFrom' | 'dateEventTo'): boolean {
    if ((option === 'eventHistoryTypes' || option === 'workflows') && this.historyFilterForm?.get(option)?.value?.length > 0) {
      return true;
    } else if ((option === 'dateEventFrom' || option === 'dateEventTo') && this.historyFilterForm?.get(option)?.value) {
      return true;
    }
    return false;
  }

  public isFilterActive(): boolean {
    const filterValue = this.historyFilterForm.value;
    if (
      filterValue &&
      (filterValue.dateEventFrom ||
        filterValue.dateEventTo ||
        filterValue.eventHistoryTypes.length ||
        filterValue.workflows.length)
    ) {
      return true;
    }
    return false;
  }

  public getEnabledDate(type: 'max' | 'min'): Date | null {
    if (type === 'max') {
      if (this.historyFilterForm.get('dateEventTo').value) {
        return this.historyFilterForm.get('dateEventTo').value;
      } else {
        return this.historyFilterOptions.dateEvent.max;
      }
    } else {
      if (this.historyFilterForm.get('dateEventFrom').value) {
        return this.historyFilterForm.get('dateEventFrom').value;
      } else {
        return this.historyFilterOptions.dateEvent.min;
      }
    }
  }

  public getHistoryDescription(item: CardHistoryDTO): string {
    let html = item.description;
    if (html.indexOf('[') >= 0 && html.indexOf(']') >= 0) {
      html = item.description.split('[').join('<span class="substate-target">').split(']').join('</span>');
    }
    return html;
  }

  private getFilterOptions(): void {
    this.historyOriginalData?.forEach((h: CardHistoryDTO) => {
      const date = new Date(h.dateEvent);
      if (!this.historyFilterOptions.dateEvent.min || +this.historyFilterOptions.dateEvent.min > h.dateEvent) {
        this.historyFilterOptions.dateEvent.min = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
      }
      if (!this.historyFilterOptions.dateEvent.max || +this.historyFilterOptions.dateEvent.max < h.dateEvent) {
        this.historyFilterOptions.dateEvent.max = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
      }

      if (!this.historyFilterOptions.eventHistoryTypes.find((eventType) => eventType.key === h.eventHistoryType)) {
        this.historyFilterOptions.eventHistoryTypes.push({
          key: h.eventHistoryType,
          label: 'cards.eventType.' + h.eventHistoryType
        });
      }

      if (!this.historyFilterOptions.workflows.find((w) => w.id === h.workflow.id)) {
        this.historyFilterOptions.workflows.push(h.workflow);
      }
    });

    if (this.historyOriginalData?.length) {
      this.historyFilterForm.get('dateEventFrom').enable();
      this.historyFilterForm.get('dateEventTo').enable();
      this.historyFilterForm.get('eventHistoryTypes').enable();
      this.historyFilterForm.get('workflows').enable();
    }
  }

  private initForms(): void {
    this.historyFilterForm = this.formBuilder.group({
      dateEventFrom: { disabled: true, value: null },
      dateEventTo: { disabled: true, value: null },
      eventHistoryTypes: { disabled: true, value: [] },
      workflows: { disabled: true, value: [] }
    });
  }
}
