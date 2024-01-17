import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CardColumnTabDTO from '@data/models/cards/card-column-tab-dto';
import CardHistoryDTO from '@data/models/cards/card-history';
import CardHistoryFilterDTO from '@data/models/cards/card-history-filter';
import UserDetailsDTO from '@data/models/user-permissions/user-details-dto';
import { CardAttachmentsService } from '@data/services/card-attachments.service';
import { CardHistoryService } from '@data/services/card-history.service';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { finalize, take } from 'rxjs/operators';

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
    migration: marker('cards.migration'),
    user: marker('common.user'),
    from: marker('common.from'),
    to: marker('common.to'),
    noDataToShow: marker('errors.noDataToShow'),
    cancel: marker('common.cancel')
  };
  public historyOriginalData: CardHistoryDTO[] = [];
  public historyData: CardHistoryDTO[] = [];
  public historyFilter: CardHistoryFilterDTO = null;
  public historyFilterOptions: {
    users: UserDetailsDTO[];
    dateEvent: { min: Date; max: Date };
    eventHistoryTypes: { key: string; label: string }[];
    workflows: {
      id: number;
      name: string;
      status: string;
    }[];
  } = {
    users: [],
    dateEvent: { min: null, max: null },
    eventHistoryTypes: [],
    workflows: []
  };
  public historyFilterForm: UntypedFormGroup;
  public dataLoaded = false;
  public lastDatesSelected: {
    ini: Date;
    end: Date;
  } = {
    ini: null,
    end: null
  };

  constructor(
    private cardHistoryService: CardHistoryService,
    private route: ActivatedRoute,
    private globalMessageService: GlobalMessageService,
    private translateService: TranslateService,
    private formBuilder: UntypedFormBuilder,
    private confirmDialogService: ConfirmDialogService,
    private spinnerService: ProgressSpinnerDialogService,
    private cardAttachmentService: CardAttachmentsService
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
    if (filter.users?.length) {
      const ids = [...filter.users].map((user) => user.id);
      dataToShow = dataToShow.filter((item: CardHistoryDTO) => ids.indexOf(item.user.id) >= 0);
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
    if (this.historyFilterForm.get('users').value.length) {
      this.historyFilterForm.get('users').setValue([]);
    }
    if (this.historyFilterForm.get('workflows').value.length) {
      this.historyFilterForm.get('workflows').setValue([]);
    }
    this.filterChange();
  }

  public hasData(option: 'eventHistoryTypes' | 'workflows' | 'dateEventFrom' | 'dateEventTo' | 'users'): boolean {
    if (
      (option === 'eventHistoryTypes' || option === 'workflows' || option === 'users') &&
      this.historyFilterForm?.get(option)?.value?.length > 0
    ) {
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
        filterValue.workflows.length ||
        filterValue.users.length)
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
    if (item.eventHistoryType === 'MIGRATION') {
      html = this.translateService.instant(this.labels.migration);
    }
    let style = '';
    if (html && html.indexOf('[') >= 0 && html.indexOf(']') >= 0) {
      if (item.workflowSubstateTarget?.color) {
        style = `style="background-color: ${item.workflowSubstateTarget?.color}; color: ${this.getFontColor(
          item.workflowSubstateTarget?.color
        )}"`;
      }
      html = item.description.split('[').join(`<span class="substate-target" ${style}>`).split(']').join('</span>');
    }
    return html;
  }

  public getHistoryComment(item: CardHistoryDTO): string {
    if (item.cardInstanceRemoteSignature) {
      let state = '';
      if (item.cardInstanceRemoteSignature.status === 'PENDING') {
        state = `${this.translateService.instant(marker('signature.status.pending'))}`;
      } else if (item.cardInstanceRemoteSignature.status === 'SIGNED') {
        state = `${this.translateService.instant(marker('signature.status.signed'))}`;
      } else if (item.cardInstanceRemoteSignature.status === 'REJECTED') {
        state = `${this.translateService.instant(marker('signature.status.rejected'))}`;
      } else if (item.cardInstanceRemoteSignature.status === 'CANCELED') {
        state = `${this.translateService.instant(marker('signature.status.canceled'))}`;
      }
      if (
        item.cardInstanceRemoteSignature.status !== 'SIGNED' &&
        item.cardInstanceRemoteSignature.status !== 'REJECTED' &&
        item.cardInstanceRemoteSignature.readDate
      ) {
        state += ` (${this.translateService.instant(marker('signature.status.readen'))})`;
      } else if (item.cardInstanceRemoteSignature.status !== 'SIGNED') {
        state += ` (${this.translateService.instant(marker('signature.status.unreaden'))})`;
      }
      return `${item.comments ? item.comments : ''}<ul><li>${this.translateService.instant('cards.column.template')}: ${
        item.cardInstanceRemoteSignature.templateChecklist.template.name
      }</li><li>${this.translateService.instant(marker('common.state'))}: ${state}</li></ul>`;
    } else {
      return item.comments;
    }
  }

  public getCircleStyles(item: CardHistoryDTO): string {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const styles: any = {};
    if (item.workflowSubstateTarget?.exitPoint && item.workflowSubstateTarget?.color) {
      styles['background-color'] = item.workflowSubstateTarget.color;
    }
    return styles;
  }

  public filterDateChange(type: 'ini' | 'end') {
    if (type === 'ini') {
      const value = this.historyFilterForm.get('dateEventFrom').value;
      if (this.lastDatesSelected.ini && +this.lastDatesSelected.ini === +value) {
        this.lastDatesSelected.ini = null;
        this.historyFilterForm.get('dateEventFrom').setValue(null);
      } else {
        this.lastDatesSelected.ini = value;
      }
    } else {
      const value = this.historyFilterForm.get('dateEventTo').value;
      if (this.lastDatesSelected.ini && +this.lastDatesSelected.ini === +value) {
        this.lastDatesSelected.ini = null;
        this.historyFilterForm.get('dateEventTo').setValue(null);
      } else {
        this.lastDatesSelected.ini = value;
      }
    }
    this.filterChange();
  }

  public cancelRemoteSignature(item: CardHistoryDTO): void {
    this.confirmDialogService
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('signature.cancelConfirmation'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          const spinner = this.spinnerService.show();
          this.cardAttachmentService
            .cancelRemoteSignature(this.historyFilter.cardInstanceWorkflowId, item.cardInstanceRemoteSignature.id)
            .pipe(
              take(1),
              finalize(() => this.spinnerService.hide(spinner))
            )
            .subscribe({
              next: () => {
                this.globalMessageService.showSuccess({
                  message: this.translateService.instant(marker('common.successOperation')),
                  actionText: this.translateService.instant(marker('common.close'))
                });
                this.getData();
              },
              error: (error: ConcenetError) => {
                this.globalMessageService.showError({
                  message: error.message,
                  actionText: this.translateService.instant(marker('common.close'))
                });
              }
            });
        }
      });
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
      if (!this.historyFilterOptions.users.find((user) => user.id === h.user.id)) {
        this.historyFilterOptions.users.push(h.user);
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
      console.log(this.historyFilterOptions);
    });

    if (this.historyOriginalData?.length) {
      this.historyFilterForm.get('dateEventFrom').enable();
      this.historyFilterForm.get('dateEventTo').enable();
      this.historyFilterForm.get('eventHistoryTypes').enable();
      this.historyFilterForm.get('workflows').enable();
      this.historyFilterForm.get('users').enable();
    }
  }

  private initForms(): void {
    this.historyFilterForm = this.formBuilder.group({
      dateEventFrom: { disabled: true, value: null },
      dateEventTo: { disabled: true, value: null },
      eventHistoryTypes: { disabled: true, value: [] },
      workflows: { disabled: true, value: [] },
      users: { disabled: true, value: [] }
    });
  }

  private getFontColor(btnColor: string): string {
    const lightColor = '#fff';
    const darkColor = '#000';
    if (btnColor) {
      const bgColor = btnColor;
      const color = bgColor.charAt(0) === '#' ? bgColor.substring(1, 7) : bgColor;
      const r = parseInt(color.substring(0, 2), 16); // hexToR
      const g = parseInt(color.substring(2, 4), 16); // hexToG
      const b = parseInt(color.substring(4, 6), 16); // hexToB
      return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? darkColor : lightColor;
    }
    return darkColor;
  }
}
