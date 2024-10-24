import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import AdvSearchDTO from '@data/models/adv-search/adv-search-dto';
import UserDTO from '@data/models/user-permissions/user-dto';
import { AdvSearchService } from '@data/services/adv-search.service';
import {
  UserSearcherDialogComponent,
  UserSearcherDialogComponentModalEnum
} from '@modules/feature-modules/user-searcher-dialog/user-searcher-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { CustomDialogFooterConfigI } from '@shared/modules/custom-dialog/interfaces/custom-dialog-footer-config';
import { ComponentToExtendForCustomDialog } from '@shared/modules/custom-dialog/models/component-for-custom-dialog';
import { CustomDialogService } from '@shared/modules/custom-dialog/services/custom-dialog.service';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import lodash from 'lodash';
import moment from 'moment';
import { catchError, finalize, map, Observable, of, take } from 'rxjs';

export const enum AdvSearchSaveFavDialogComponentModalEnum {
  ID = 'adv-search-save-fav-dialog-id',
  PANEL_CLASS = 'adv-search-save-fav-dialog',
  TITLE = 'advSearch.saveFavOperation.title'
}

@Component({
  selector: 'app-adv-search-save-fav-dialog',
  templateUrl: './adv-search-save-fav-dialog.component.html',
  styleUrls: ['./adv-search-save-fav-dialog.component.scss']
})
export class AdvSearchSaveFavDialogComponent extends ComponentToExtendForCustomDialog implements OnInit {
  public labels = {
    name: marker('advSearch.saveFavOperation.name'),
    required: marker('errors.required'),
    allUsers: marker('advSearch.saveFavOperation.allUsers'),
    saveAsNew: marker('advSearch.saveFavOperation.saveAsNew'),
    scheduledQueryMark: marker('advSearch.saveFavOperation.scheduledQueryMark'),
    typeOfFrequency: marker('advSearch.saveFavOperation.typeOfFrequency'),
    date: marker('advSearch.saveFavOperation.date'),
    dayOfWeek: marker('advSearch.saveFavOperation.dayOfWeek'),
    dayOfMonth: marker('advSearch.saveFavOperation.dayOfMonth'),
    receivers: marker('advSearch.saveFavOperation.receivers'),
    monday: marker('advSearch.saveFavOperation.monday'),
    tuesday: marker('advSearch.saveFavOperation.tuesday'),
    wednesday: marker('advSearch.saveFavOperation.wednesday'),
    thursday: marker('advSearch.saveFavOperation.thursday'),
    friday: marker('advSearch.saveFavOperation.friday'),
    saturday: marker('advSearch.saveFavOperation.saturday'),
    sunday: marker('advSearch.saveFavOperation.sunday'),
    january: marker('advSearch.saveFavOperation.january'),
    february: marker('advSearch.saveFavOperation.february'),
    march: marker('advSearch.saveFavOperation.march'),
    april: marker('advSearch.saveFavOperation.april'),
    may: marker('advSearch.saveFavOperation.may'),
    june: marker('advSearch.saveFavOperation.june'),
    july: marker('advSearch.saveFavOperation.july'),
    august: marker('advSearch.saveFavOperation.august'),
    september: marker('advSearch.saveFavOperation.september'),
    october: marker('advSearch.saveFavOperation.october'),
    november: marker('advSearch.saveFavOperation.november'),
    december: marker('advSearch.saveFavOperation.december'),
    single: marker('advSearch.saveFavOperation.single'),
    daily: marker('advSearch.saveFavOperation.daily'),
    weekly: marker('advSearch.saveFavOperation.weekly'),
    monthly: marker('advSearch.saveFavOperation.monthly'),
    addUser: marker('advSearch.saveFavOperation.addUser'),
    fullName: marker('advSearch.saveFavOperation.fullName'),
    email: marker('advSearch.saveFavOperation.email'),
    noDataToShow: marker('advSearch.saveFavOperation.noDataToShow')
  };
  public displayedColumns = ['fullName', 'email', 'actions'];
  public advSearchForm: FormGroup;
  public isAdmin = false;
  public saveAsNewFormControl = new FormControl(false);
  public showDate = false;
  public showWeekday = false;
  public showDayOfMonth = false;
  public showDiary = false;
  public tableUsers: UserDTO[];
  public filterOptions = [
    { id: 'SINGLE', name: this.translateService.instant('advSearch.saveFavOperation.single') },
    { id: 'DAILY', name: this.translateService.instant('advSearch.saveFavOperation.daily') },
    { id: 'WEEKLY', name: this.translateService.instant('advSearch.saveFavOperation.weekly') },
    { id: 'MONTHLY', name: this.translateService.instant('advSearch.saveFavOperation.monthly') }
  ];
  public weekDays = [
    { value: '1', label: this.translateService.instant('advSearch.saveFavOperation.monday') },
    { value: '2', label: this.translateService.instant('advSearch.saveFavOperation.tuesday') },
    { value: '3', label: this.translateService.instant('advSearch.saveFavOperation.wednesday') },
    { value: '4', label: this.translateService.instant('advSearch.saveFavOperation.thursday') },
    { value: '5', label: this.translateService.instant('advSearch.saveFavOperation.friday') },
    { value: '6', label: this.translateService.instant('advSearch.saveFavOperation.saturday') },
    { value: '7', label: this.translateService.instant('advSearch.saveFavOperation.sunday') }
  ];
  public monthDays = [
    { value: '1', label: this.translateService.instant('advSearch.saveFavOperation.january') },
    { value: '2', label: this.translateService.instant('advSearch.saveFavOperation.february') },
    { value: '3', label: this.translateService.instant('advSearch.saveFavOperation.march') },
    { value: '4', label: this.translateService.instant('advSearch.saveFavOperation.april') },
    { value: '5', label: this.translateService.instant('advSearch.saveFavOperation.may') },
    { value: '6', label: this.translateService.instant('advSearch.saveFavOperation.june') },
    { value: '7', label: this.translateService.instant('advSearch.saveFavOperation.july') },
    { value: '8', label: this.translateService.instant('advSearch.saveFavOperation.august') },
    { value: '9', label: this.translateService.instant('advSearch.saveFavOperation.september') },
    { value: '10', label: this.translateService.instant('advSearch.saveFavOperation.october') },
    { value: '11', label: this.translateService.instant('advSearch.saveFavOperation.november') },
    { value: '12', label: this.translateService.instant('advSearch.saveFavOperation.december') }
  ];

  private previousName: string = null;
  constructor(
    private translateService: TranslateService,
    private advSearchService: AdvSearchService,
    private globalMessageService: GlobalMessageService,
    private spinnerService: ProgressSpinnerDialogService,
    private customDialogService: CustomDialogService,
    private confirmDialogService: ConfirmDialogService
  ) {
    super(AdvSearchSaveFavDialogComponentModalEnum.ID, AdvSearchSaveFavDialogComponentModalEnum.PANEL_CLASS, '');
  }

  get advSearch(): AdvSearchDTO {
    return this.advSearchForm.getRawValue() as AdvSearchDTO;
  }

  get form() {
    return this.advSearchForm.controls;
  }

  public onFilterChange(selectedValue: string): void {
    this.resetVisibility();
    if (selectedValue === 'SINGLE') {
      this.showDate = true;
    } else if (selectedValue === 'DAILY') {
      this.showDiary = true;
    } else if (selectedValue === 'WEEKLY') {
      this.showWeekday = true;
    } else if (selectedValue === 'MONTHLY') {
      this.showDayOfMonth = true;
    }
  }

  ngOnInit(): void {
    this.previousName = this.extendedComponentData.advSearchForm.get('name').value;
    this.advSearchForm = lodash.cloneDeep(this.extendedComponentData.advSearchForm);
    this.tableUsers = this.advSearchForm.get('scheduledReceivers').value;
    this.isAdmin = this.extendedComponentData.isAdmin;
    if (this.advSearch.editable && this.advSearch.id) {
      super.MODAL_TITLE = this.translateService.instant(marker('advSearch.saveFavOperation.editModeTitle'));
    } else if (!this.advSearch.id) {
      super.MODAL_TITLE = this.translateService.instant(marker('advSearch.saveFavOperation.newModeTitle'));
    } else if (!this.advSearch.editable && this.advSearch.id) {
      super.MODAL_TITLE = this.translateService.instant(marker('advSearch.saveFavOperation.duplicateModeTitle'));
    } else {
      super.MODAL_TITLE = this.translateService.instant(marker('advSearch.saveFavOperation.title'));
    }
    if (this.advSearchForm.get('scheduleType')?.value) {
      this.onFilterChange(this.advSearchForm.get('scheduleType')?.value);
    }
  }

  public confirmCloseCustomDialog(): Observable<boolean> {
    return of(true);
  }
  public getSubmitError(): string {
    let error: string = null;
    if (
      ((!this.advSearch.editable && this.advSearch.id) || this.saveAsNewFormControl.value) &&
      this.previousName === this.advSearchForm.get('name').value
    ) {
      error = this.translateService.instant(marker('advSearch.saveFavOperation.errorSameName'));
    }
    return error;
  }

  public onSubmitCustomDialog(): Observable<AdvSearchDTO | boolean> {
    const dataToSend: AdvSearchDTO = this.advSearchForm.getRawValue();

    if ((!this.advSearch.editable && this.advSearch.id) || this.saveAsNewFormControl.value) {
      dataToSend.id = null;
    }
    dataToSend.advancedSearchContext.dateCardFrom = moment(dataToSend.advancedSearchContext.dateCardFrom).format('DD/MM/YYYY');
    dataToSend.advancedSearchContext.dateCardTo = moment(dataToSend.advancedSearchContext.dateCardTo).format('DD/MM/YYYY');
    if (dataToSend.scheduledTime) {
      const time = moment(dataToSend.scheduledTime, 'HH:mm');
      if (time.isValid()) {
        time.add(2, 'hours');
        dataToSend.scheduledTime = time.valueOf().toString();
      }
    }
    if (dataToSend.advancedSearchContext.states.length) {
      dataToSend.advancedSearchContext.statesIds = dataToSend.advancedSearchContext.states.map((item) => item.id);
    }
    if (dataToSend.advancedSearchContext.substates.length) {
      dataToSend.advancedSearchContext.substatesIds = dataToSend.advancedSearchContext.substates.map((item) => item.id);
    }
    if (dataToSend.advancedSearchContext.workflows.length) {
      dataToSend.advancedSearchContext.workflowsIds = dataToSend.advancedSearchContext.workflows.map((item) => item.id);
    }
    if (dataToSend.advancedSearchContext.facilities.length) {
      dataToSend.advancedSearchContext.facilitiesIds = dataToSend.advancedSearchContext.facilities.map((item) => item.id);
    }
    dataToSend.scheduledReceivers = this.tableUsers;
    const spinner = this.spinnerService.show();
    return this.advSearchService.createAdvSearch(dataToSend).pipe(
      map((response) => {
        this.globalMessageService.showSuccess({
          message: this.translateService.instant(marker('common.successOperation')),
          actionText: this.translateService.instant(marker('common.close'))
        });
        return response;
      }),
      catchError((error) => {
        this.globalMessageService.showError({
          message: error.error.message,
          actionText: this.translateService.instant(marker('common.close'))
        });
        return of(false);
      }),
      finalize(() => {
        this.spinnerService.hide(spinner);
      })
    );
  }

  public openDeleteDialog(id: number) {
    this.confirmDialogService
      .open({
        maxWidth: 500,
        title: this.translateService.instant(marker('advSearch.saveFavOperation.deleteReceiver')),
        message: this.translateService.instant(marker('advSearch.saveFavOperation.deleteReceiverMessage'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          const usuariosActualizados = this.tableUsers.filter((usuarioExistente: UserDTO) => usuarioExistente.id !== id);
          this.tableUsers = [...usuariosActualizados];
        }
      });
  }
  public addUser(): void {
    this.customDialogService
      .open({
        id: UserSearcherDialogComponentModalEnum.ID,
        panelClass: UserSearcherDialogComponentModalEnum.PANEL_CLASS,
        component: UserSearcherDialogComponent,
        extendedComponentData: { filter: null, multiple: true },
        disableClose: true,
        width: '50%',
        maxWidth: '900px'
      })
      .pipe(take(1))
      .subscribe(async (response) => {
        if (response && Array.isArray(response)) {
          this.tableUsers = this.tableUsers || [];
          const nuevosUsuarios = response.filter(
            (nuevoUsuario: UserDTO) =>
              !this.tableUsers?.some((usuarioExistente: UserDTO) => usuarioExistente.id === nuevoUsuario.id)
          );
          this.tableUsers = [...this.tableUsers, ...nuevosUsuarios];
        }
      });
  }

  public setAndGetFooterConfig(): CustomDialogFooterConfigI | null {
    return {
      show: true,
      leftSideButtons: [
        {
          type: 'close',
          label: marker('common.cancel'),
          design: 'flat'
        }
      ],
      rightSideButtons: [
        {
          type: 'submit',
          label: marker('common.save'),
          design: 'raised',
          color: 'primary',
          disabledFn: () => !this.advSearchForm.get('name').value || this.getSubmitError() !== null
        }
      ]
    };
  }
  private resetVisibility(): void {
    this.showDate = false;
    this.showWeekday = false;
    this.showDayOfMonth = false;
    this.showDiary = false;
  }
}
