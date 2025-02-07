import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '@app/security/authentication.service';
import { UserService } from '@data/services/user.service';
import { CustomDialogFooterConfigI } from '@shared/modules/custom-dialog/interfaces/custom-dialog-footer-config';
import { ComponentToExtendForCustomDialog } from '@shared/modules/custom-dialog/models/component-for-custom-dialog';
import { CustomDialogService } from '@shared/modules/custom-dialog/services/custom-dialog.service';
import { Observable, of } from 'rxjs';

export const enum ModalFetchDataPreF2AComponentEnum {
  ID = 'choose-doble-factor-dialog-id',
  PANEL_CLASS = 'choose-doble-factor-dialog',
  TITLE = 'Introduce datos'
}

@Component({
  selector: 'app-modal-fetch-data-pre-f2a',
  templateUrl: './modal-fetch-data-pre-f2a.component.html',
  styleUrls: ['./modal-fetch-data-pre-f2a.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ModalFetchDataPreF2AComponent extends ComponentToExtendForCustomDialog implements OnInit, OnDestroy {
  public labels = {};

  public userId: number;
  public email: string;
  public phoneNumber: string;
  public preF2aForm: UntypedFormGroup;

  constructor(
    private fb: UntypedFormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private userservice: UserService,
    private customDialogService: CustomDialogService,
    private authenticationService: AuthenticationService
  ) {
    super(
      ModalFetchDataPreF2AComponentEnum.ID,
      ModalFetchDataPreF2AComponentEnum.PANEL_CLASS,
      ModalFetchDataPreF2AComponentEnum.TITLE
    );
  }

  ngOnInit(): void {
    this.initializeForm();
    this.userId = this.extendedComponentData.id;
    this.phoneNumber = this.extendedComponentData.phoneNumber;
    this.email = this.extendedComponentData.email;
  }

  ngOnDestroy(): void {}

  public confirmCloseCustomDialog(): Observable<boolean> {
    return of(true);
  }

  public onSubmitCustomDialog(): Observable<boolean> {
    return of(false);
  }

  public setAndGetFooterConfig(): CustomDialogFooterConfigI | null {
    return {
      show: true,
      leftSideButtons: [],
      rightSideButtons: [
        {
          type: 'submit',
          label: 'Guardar',
          design: 'raised',
          color: 'primary',
          disabledFn: () => !this.preF2aForm.valid
        }
      ]
    };
  }

  private initializeForm(): void {
    this.preF2aForm = this.fb.group(
      {
        email: [this.email ? this.email : ''],
        phone: [this.phoneNumber ? this.phoneNumber : '']
      },
      { validators: this.atLeastOneRequiredValidator }
    );
  }

  private atLeastOneRequiredValidator(form: AbstractControl): { [key: string]: boolean } | null {
    const email = form.get('email')?.value;
    const phone = form.get('phone')?.value;
    if (!email && !phone) {
      return { atLeastOneRequired: true };
    }
    return null;
  }
}
