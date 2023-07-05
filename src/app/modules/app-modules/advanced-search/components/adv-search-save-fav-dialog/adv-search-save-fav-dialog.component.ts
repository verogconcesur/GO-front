import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { PermissionConstants } from '@app/constants/permission.constants';
import { AuthenticationService } from '@app/security/authentication.service';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import AdvSearchDTO from '@data/models/adv-search/adv-search-dto';
import { ComponentToExtendForCustomDialog, CustomDialogFooterConfigI } from '@jenga/custom-dialog';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { Observable, of } from 'rxjs';
import _ from 'lodash';

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
  constructor(
    private confirmDialogService: ConfirmDialogService,
    private translateService: TranslateService,
    private authService: AuthenticationService
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
    this.advSearchForm = _.cloneDeep(this.extendedComponentData.advSearchForm);
    this.isAdmin = this.authService.getUserPermissions().find((permission) => permission.code === PermissionConstants.ISADMIN)
      ? true
      : false;
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
    return this.confirmDialogService.open({
      title: this.translateService.instant(marker('common.warning')),
      message: this.translateService.instant(marker('errors.ifContinueLosingChanges'))
    });
  }

  public onSubmitCustomDialog(): Observable<FormGroup> {
    return of(this.advSearchForm);
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
          disabledFn: () => !this.advSearchForm.get('name').value
        }
      ]
    };
  }
}
