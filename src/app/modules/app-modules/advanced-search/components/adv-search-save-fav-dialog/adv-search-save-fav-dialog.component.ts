import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import AdvSearchDTO from '@data/models/adv-search/adv-search-dto';
import { AdvSearchService } from '@data/services/adv-search.service';
import { TranslateService } from '@ngx-translate/core';
import { CustomDialogFooterConfigI } from '@shared/modules/custom-dialog/interfaces/custom-dialog-footer-config';
import { ComponentToExtendForCustomDialog } from '@shared/modules/custom-dialog/models/component-for-custom-dialog';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import lodash from 'lodash';
import moment from 'moment';
import { Observable, catchError, finalize, map, of } from 'rxjs';

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
    saveAsNew: marker('advSearch.saveFavOperation.saveAsNew')
  };
  public advSearchForm: FormGroup;
  public isAdmin = false;
  public saveAsNewFormControl = new FormControl(false);
  public showDate = false;
  public showWeekday = false;
  public showDayOfMonth = false;
  public showDiary = false;
  public filterOptions = [
    { id: 'SINGLE', name: 'Unica' },
    { id: 'DAILY', name: 'Diaria' },
    { id: 'WEEKLY', name: 'Semanal' },
    { id: 'MONTHLY', name: 'Mensual' }
  ];
  public weekDays = [
    { value: '1', label: 'Lunes' },
    { value: '2', label: 'Martes' },
    { value: '3', label: 'Miércoles' },
    { value: '4', label: 'Jueves' },
    { value: '5', label: 'Viernes' },
    { value: '6', label: 'Sábado' },
    { value: '7', label: 'Domingo' }
  ];
  public monthDays = [
    { value: '1', label: 'Enero' },
    { value: '2', label: 'Febrero' },
    { value: '3', label: 'Marzo' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Mayo' },
    { value: '6', label: 'Junio' },
    { value: '7', label: 'Julio' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' }
  ];
  private previousName: string = null;
  constructor(
    private translateService: TranslateService,
    private advSearchService: AdvSearchService,
    private globalMessageService: GlobalMessageService,
    private spinnerService: ProgressSpinnerDialogService
  ) {
    super(AdvSearchSaveFavDialogComponentModalEnum.ID, AdvSearchSaveFavDialogComponentModalEnum.PANEL_CLASS, '');
  }

  get advSearch(): AdvSearchDTO {
    return this.advSearchForm.getRawValue() as AdvSearchDTO;
  }

  get form() {
    return this.advSearchForm.controls;
  }
  // onCheckboxChange(event: MatCheckboxChange): void {
  //   console.log(event.checked);
  //   console.log(this.advSearchForm.get('scheduled').value);
  // }
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
    console.log(dataToSend);
    console.log(dataToSend);
    const scheduledTime = dataToSend.scheduledTime;
    if (scheduledTime) {
      const formattedTime = moment(scheduledTime, 'HH:mm').format('HH:mm:ss');
      dataToSend.scheduledTime = formattedTime;
    }

    if ((!this.advSearch.editable && this.advSearch.id) || this.saveAsNewFormControl.value) {
      dataToSend.id = null;
    }
    dataToSend.advancedSearchContext.dateCardFrom = moment(dataToSend.advancedSearchContext.dateCardFrom).format('DD/MM/YYYY');
    dataToSend.advancedSearchContext.dateCardTo = moment(dataToSend.advancedSearchContext.dateCardTo).format('DD/MM/YYYY');

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

  validateTime(event: Event): void {
    const input = event.target as HTMLInputElement;
    const timeValue = input.value;
    const [hours, minutes] = timeValue.split(':').map(Number);
    const roundedMinutes = Math.round(minutes / 30) * 30;
    const newHours = roundedMinutes === 60 ? hours + 1 : hours;
    const newMinutes = roundedMinutes === 60 ? 0 : roundedMinutes;
    const formattedTime = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
    if (formattedTime !== timeValue) {
      input.value = formattedTime;
      this.advSearchForm.get('scheduledTime')?.setValue(formattedTime);
    }
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
