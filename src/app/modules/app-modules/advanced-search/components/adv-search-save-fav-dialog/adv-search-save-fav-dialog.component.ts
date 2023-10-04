import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import AdvSearchDTO from '@data/models/adv-search/adv-search-dto';
import { ComponentToExtendForCustomDialog, CustomDialogFooterConfigI } from '@jenga/custom-dialog';
import { TranslateService } from '@ngx-translate/core';
import { Observable, catchError, finalize, map, of } from 'rxjs';
import _ from 'lodash';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { AdvSearchService } from '@data/services/adv-search.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import moment from 'moment';

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

  ngOnInit(): void {
    this.previousName = this.extendedComponentData.advSearchForm.get('name').value;
    this.advSearchForm = _.cloneDeep(this.extendedComponentData.advSearchForm);
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
}
