import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DATE_RANGE_SELECTION_STRATEGY, MatDateRangePicker, MatDatepicker } from '@angular/material/datepicker';
import { ChildActivationEnd, NavigationEnd, Router } from '@angular/router';
import { PerformanceService } from '@app/services/performance.service';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import FacilityDTO from '@data/models/organization/facility-dto';
import WorkflowCardDTO from '@data/models/workflows/workflow-card-dto';
import WorkflowDTO from '@data/models/workflows/workflow-dto';
import WorkflowFilterDTO from '@data/models/workflows/workflow-filter-dto';
import { WorkflowsService } from '@data/services/workflows.service';
import { TranslateService } from '@ngx-translate/core';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { MaxRangeSelectionStrategy } from '@shared/utils/DateRangeWeekSelectionStrategy';
import moment from 'moment';
import { NGXLogger } from 'ngx-logger';
import { Subscription, skip, take } from 'rxjs';
import { WorkflowFilterService } from '../../aux-service/workflow-filter.service';
import { WorkflowPrepareAndMoveService } from '../../aux-service/workflow-prepare-and-move-aux.service';
import { RouteConstants } from '@app/constants/route.constants';
import { ConcenetError } from '@app/types/error';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { haveArraysSameValuesIdObjects } from '@shared/utils/array-comparation-function';
import _ from 'lodash';
import WorkflowCalendarHourLineDTO from '@data/models/workflows/workflow-calendar-hour-line-dto';
import WorkflowCalendarBodyDTO from '@data/models/workflows/workflow-calendar-body-dto';

@UntilDestroy()
@Component({
  selector: 'app-workflow-calendar-view',
  templateUrl: './workflow-calendar-view.component.html',
  providers: [
    {
      provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
      useClass: MaxRangeSelectionStrategy
    }
  ],
  styleUrls: ['./workflow-calendar-view.component.scss']
})
export class WorkflowCalendarViewComponent implements OnInit {
  @ViewChild('picker') datePicker: MatDatepicker<Date>;
  @ViewChild('rangePicker') rangePicker: MatDateRangePicker<Date>;
  public labels = {
    noData: marker('errors.noDataToShow'),
    day: marker('workflows.calendar.day'),
    week: marker('workflows.calendar.week'),
    totalCardsDay: marker('workflows.calendar.totalCardsDay'),
    totalCardsWeek: marker('workflows.calendar.totalCardsWeek')
  };
  public showCalendarView = true;
  public facilities: FacilityDTO[] = [];
  public workflow: WorkflowDTO = null;
  public formFilters: FormGroup;
  public totalCards = { totalCards: 0 };
  public loadedData: { workflow: WorkflowDTO; facilities: FacilityDTO[] };
  public calendarLines: WorkflowCalendarHourLineDTO[] = [];
  private filters: WorkflowFilterDTO = null;
  private cardList: WorkflowCardDTO[] = [];
  private subjectSubscription: Subscription;
  constructor(
    private fb: FormBuilder,
    private workflowService: WorkflowsService,
    private workflowFilterService: WorkflowFilterService,
    private spinnerService: ProgressSpinnerDialogService,
    private globalMessageService: GlobalMessageService,
    private logger: NGXLogger,
    private translateService: TranslateService,
    private prepareAndMoveService: WorkflowPrepareAndMoveService,
    private performanceService: PerformanceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    //Sólo inicializamos listeners si tenemos seleccionad un workflow (tenemos wId en la url)
    if (this.router.url.indexOf(`${RouteConstants.WORKFLOWS}/${RouteConstants.WORKFLOWS_CALENDAR_VIEW}`) === -1) {
      this.initListeners();
    }
    this.initForm();
  }
  public modeActive(mode: 'WEEK' | 'DAY'): boolean {
    return this.formFilters.get('mode').value === mode;
  }
  public changeMode(mode: 'WEEK' | 'DAY'): void {
    const currentMode = this.formFilters.get('mode').value;
    if (currentMode !== mode) {
      if (mode === 'WEEK') {
        this.formFilters.get('mode').setValue(mode);
        const singleDay = moment(this.formFilters.get('singleDay').getRawValue());
        this.formFilters.get('initDay').setValue(singleDay.startOf('week').toDate(), { emitEvent: false, onlySelf: true });
        this.formFilters.get('endDay').setValue(singleDay.endOf('week').toDate(), { emitEvent: false, onlySelf: true });
      } else {
        this.formFilters.get('mode').setValue(mode);
        this.formFilters.get('singleDay').setValue(this.formFilters.get('initDay').value);
      }
    }
  }
  public getDate(): string {
    const currentMode = this.formFilters.get('mode').value;
    if (currentMode === 'WEEK') {
      return (
        moment(this.formFilters.get('initDay').value).format('DD MMM') +
        ' - ' +
        moment(this.formFilters.get('endDay').value).format('DD MMM')
      );
    } else {
      return moment(this.formFilters.get('singleDay').value).format('DD MMMM');
    }
  }
  public changeDate(option: 'UP' | 'DOWN'): void {
    const mode = this.modeActive('WEEK') ? 'week' : 'day';
    if (option === 'UP') {
      if (mode === 'week') {
        this.formFilters
          .get('initDay')
          .setValue(moment(this.formFilters.get('initDay').value).add(1, mode).toDate(), { emitEvent: false, onlySelf: true });
        this.formFilters
          .get('endDay')
          .setValue(moment(this.formFilters.get('endDay').value).add(1, mode).toDate(), { emitEvent: false, onlySelf: true });
      } else {
        this.formFilters.get('singleDay').setValue(moment(this.formFilters.get('singleDay').value).add(1, mode).toDate());
      }
    } else {
      if (mode === 'week') {
        this.formFilters.get('initDay').setValue(moment(this.formFilters.get('initDay').value).subtract(1, mode).toDate(), {
          emitEvent: false,
          onlySelf: true
        });
        this.formFilters.get('endDay').setValue(moment(this.formFilters.get('endDay').value).subtract(1, mode).toDate(), {
          emitEvent: false,
          onlySelf: true
        });
      } else {
        this.formFilters.get('singleDay').setValue(moment(this.formFilters.get('singleDay').value).subtract(1, mode).toDate());
      }
    }
  }
  public openPicker(): void {
    if (this.modeActive('WEEK')) {
      this.rangePicker.open();
    } else {
      this.datePicker.open();
    }
  }
  public initForm(): void {
    this.formFilters = this.fb.group({
      mode: ['WEEK'],
      singleDay: [moment().toDate()],
      initDay: [moment().startOf('week').toDate()],
      endDay: [moment().endOf('week').toDate()]
    });
    this.formFilters.get('singleDay').valueChanges.subscribe((res) => {
      this.reloadCardData();
    });
    this.formFilters.get('initDay').valueChanges.subscribe((res) => {
      this.reloadCardData();
    });
  }
  public initListeners(): void {
    this.workflowService.workflowHideCardsSubject$.pipe(untilDestroyed(this)).subscribe((hide: boolean) => {
      if (hide) {
        this.showCalendarView = false;
      }
    });
    this.workflowService.workflowSelectedSubject$.pipe(untilDestroyed(this)).subscribe((workflow: WorkflowDTO) => {
      this.workflow = workflow;
    });
    this.workflowService.facilitiesSelectedSubject$.pipe(untilDestroyed(this)).subscribe((facilities: FacilityDTO[]) => {
      this.facilities = facilities;
      if (this.subjectSubscription) {
        this.subjectSubscription.unsubscribe();
      }
      this.getData();
    });
    this.workflowFilterService.workflowFilterSubject$.pipe(untilDestroyed(this)).subscribe((filter: WorkflowFilterDTO) => {
      if (this.filters?.dateType && filter?.dateType && this.filters.dateType.id === filter.dateType.id) {
        this.filters = filter;
        this.filterData();
      } else {
        this.filters = filter;
        this.reloadCardData();
      }
    });
    this.prepareAndMoveService.reloadData$
      .pipe(untilDestroyed(this))
      .subscribe((data: 'MOVES_IN_THIS_WORKFLOW' | 'MOVES_IN_OTHER_WORKFLOWS') => {
        if (data === 'MOVES_IN_THIS_WORKFLOW' || data === 'MOVES_IN_OTHER_WORKFLOWS') {
          this.reloadCardData();
          this.prepareAndMoveService.reloadData$.next(null);
        }
      });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.router.events.pipe(untilDestroyed(this)).subscribe((event: any) => {
      if (event instanceof NavigationEnd || event instanceof ChildActivationEnd) {
        if (this.router.url.indexOf('(card:wcId') > 0 && this.showCalendarView) {
          console.log('Hide board view');
          this.showCalendarView = false;
        } else if (this.router.url.indexOf('(card:wcId') === -1 && !this.showCalendarView) {
          console.log('Show board view');
          this.performanceService.refreshIfNecesary();
          this.showCalendarView = true;
        }
      }
    });
  }
  public reloadCardData(): void {
    this.calendarLines = [];
    if (this.workflow && this.filters && this.filters.dateType) {
      const spinner = this.spinnerService.show();
      const body: WorkflowCalendarBodyDTO = {
        facilityIds: this.facilities ? this.facilities.map((f: FacilityDTO) => f.id) : [],
        viewCalendarDateTimeItem: this.filters.dateType,
        fromDate: '',
        toDate: ''
      };
      if (this.modeActive('WEEK')) {
        body.fromDate = moment(this.formFilters.get('initDay').value).format('YYYY-MM-DD');
        body.toDate = moment(this.formFilters.get('initDay').value).add(6, 'day').format('YYYY-MM-DD');
      } else {
        body.fromDate = moment(this.formFilters.get('singleDay').value).format('YYYY-MM-DD');
        body.toDate = moment(this.formFilters.get('singleDay').value).format('YYYY-MM-DD');
      }
      this.workflowService
        .getWorkflowCardsCalendar(this.workflow, body)
        .pipe(take(1))
        .subscribe(
          (data: WorkflowCardDTO[]) => {
            this.cardList = data;
            this.filterData();
            this.spinnerService.hide(spinner);
          },
          (error: ConcenetError) => {
            this.spinnerService.hide(spinner);
            this.logger.error(error);
            this.globalMessageService.showError({
              message: error.message,
              actionText: this.translateService.instant(marker('common.close'))
            });
          }
        );
    }
  }

  private filterData() {
    const filteredCards = this.workflowFilterService.filterDataCalendar(this.cardList, this.filters);
    _.forEach(filteredCards, (card: WorkflowCardDTO) =>
      console.log(moment(card.cardInstanceWorkflows[0].calendarDate).format('YYYY-MM-DD HH:mm'))
    );
    this.totalCards = { totalCards: filteredCards.length };
    this.calendarLines = [];
    const hour = moment().startOf('day');
    while (hour.isSame(moment(), 'day')) {
      const hourLine: WorkflowCalendarHourLineDTO = {
        hour: moment(hour),
        days: []
      };
      if (this.modeActive('DAY')) {
        hourLine.days.push({
          day: moment(this.formFilters.get('singleDay').value),
          cards: _.filter(
            filteredCards,
            (card: WorkflowCardDTO) =>
              moment(card.cardInstanceWorkflows[0].calendarDate).get('hour') === hourLine.hour.get('hour') &&
              moment(card.cardInstanceWorkflows[0].calendarDate).get('day') ===
                moment(this.formFilters.get('singleDay').value).get('day')
          )
        });
      } else {
        const day = moment(this.formFilters.get('initDay').value);
        while (day.isSameOrBefore(moment(this.formFilters.get('endDay').value, 'day'))) {
          hourLine.days.push({
            day: moment(day),
            cards: _.filter(
              filteredCards,
              (card: WorkflowCardDTO) =>
                moment(card.cardInstanceWorkflows[0].calendarDate).get('hour') === hourLine.hour.get('hour') &&
                moment(card.cardInstanceWorkflows[0].calendarDate).get('day') === moment(day).get('day')
            )
          });
          day.add(1, 'day');
        }
      }
      this.calendarLines.push(hourLine);
      hour.add(1, 'hour');
    }
  }

  private getData(): void {
    if (
      this.workflow &&
      (!this.loadedData ||
        this.workflow.id !== this.loadedData.workflow.id ||
        !haveArraysSameValuesIdObjects(this.loadedData.facilities, this.facilities))
    ) {
      this.loadedData = { workflow: this.workflow, facilities: this.facilities };
      const spinner = this.spinnerService.show();
      this.workflowService
        .getWorkflowInstances(this.workflow, this.facilities, 'CALENDAR', true)
        .pipe(take(1))
        .subscribe(
          () => {
            this.spinnerService.hide(spinner);
            this.reloadCardData();
            this.subjectSubscription = this.prepareAndMoveService.moveCard$
              .pipe(untilDestroyed(this), skip(1))
              .subscribe((resp) => {
                if (resp && resp.cardInstanceWorkflowId) {
                  if (this.workflow && this.filters && this.filters.dateType) {
                    const body: WorkflowCalendarBodyDTO = {
                      facilityIds: this.facilities ? this.facilities.map((f: FacilityDTO) => f.id) : [],
                      viewCalendarDateTimeItem: this.filters.dateType,
                      fromDate: '',
                      toDate: ''
                    };
                    if (this.modeActive('WEEK')) {
                      body.fromDate = moment(this.formFilters.get('initDay').value).format('YYYY-MM-DD');
                      body.toDate = moment(this.formFilters.get('initDay').value).add(6, 'day').format('YYYY-MM-DD');
                    } else {
                      body.fromDate = moment(this.formFilters.get('singleDay').value).format('YYYY-MM-DD');
                      body.toDate = moment(this.formFilters.get('singleDay').value).format('YYYY-MM-DD');
                    }
                    this.workflowService
                      .getSingleWorkflowCalendarCard(this.workflow, body, resp.cardInstanceWorkflowId)
                      .pipe(take(1))
                      .subscribe(
                        (data: WorkflowCardDTO) => {
                          this.cardList = this.cardList.filter(
                            (card: WorkflowCardDTO) => card.cardInstanceWorkflows[0].id !== resp.cardInstanceWorkflowId
                          );
                          this.cardList.push(data);
                          this.filterData();
                        },
                        (error: ConcenetError) => {
                          this.logger.error(error);
                          this.globalMessageService.showError({
                            message: error.message,
                            actionText: this.translateService.instant(marker('common.close'))
                          });
                        }
                      );
                  }
                }
              });
          },
          (error: ConcenetError) => {
            this.spinnerService.hide(spinner);
            this.calendarLines = [];
            this.logger.error(error);
            this.globalMessageService.showError({
              message: error.message,
              actionText: this.translateService.instant(marker('common.close'))
            });
          }
        );
    }
  }
}
