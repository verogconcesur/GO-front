import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import UserDTO from '@data/models/user-permissions/user-dto';
import { UserService } from '@data/services/user.service';
import { CustomDialogFooterConfigI } from '@shared/modules/custom-dialog/interfaces/custom-dialog-footer-config';
import { ComponentToExtendForCustomDialog } from '@shared/modules/custom-dialog/models/component-for-custom-dialog';
import { CustomDialogService } from '@shared/modules/custom-dialog/services/custom-dialog.service';
import { Observable, of } from 'rxjs';

export const enum DobleFactorComponentModalEnum {
  ID = 'doble-factor-dialog-id',
  PANEL_CLASS = 'doble-factor-dialog',
  TITLE = 'DOBLE FACTOR'
}

@Component({
  selector: 'app-doblefactor',
  templateUrl: './doblefactor.component.html',
  styleUrls: ['./doblefactor.component.scss']
})
export class DoblefactorComponent extends ComponentToExtendForCustomDialog implements OnInit, OnDestroy {
  public labels = {
    title: marker('dobleFactor.title'),
    description: marker('dobleFactor.description'),
    code2FA: marker('dobleFactor.code2FA'),
    code2FAError: marker('dobleFactor.code2FAEror'),
    noCheck2FA: marker('dobleFactor.noCheck2FA'),
    send: marker('common.send')
  };

  public dobleFactorForm: UntypedFormGroup;
  public userId = '';
  public f2aMethod: string;
  public qrCode: string;

  constructor(
    private fb: UntypedFormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private userservice: UserService,
    private customDialogService: CustomDialogService,
    @Inject(MAT_DIALOG_DATA) public data: UserDTO
  ) {
    super(DobleFactorComponentModalEnum.ID, DobleFactorComponentModalEnum.PANEL_CLASS, DobleFactorComponentModalEnum.TITLE);
  }

  ngOnInit(): void {
    this.f2aMethod = this.extendedComponentData.type;
    this.qrCode = this.extendedComponentData.data.qr;
    console.log(this.qrCode);

    this.initializeForm();
  }

  ngOnDestroy(): void {}

  public confirmCloseCustomDialog(): Observable<boolean> {
    return of(true);
  }

  public onSubmitCustomDialog(): Observable<boolean> {
    this.userservice.checkUser2FA(this.userId, this.dobleFactorForm.value.code2FA).subscribe((res) => {
      if (res) {
      }
    });

    return of(false);
  }

  public setAndGetFooterConfig(): CustomDialogFooterConfigI | null {
    return {
      show: true,
      leftSideButtons: [],
      rightSideButtons: [
        {
          type: 'submit',
          label: this.labels.send,
          design: 'raised',
          color: 'primary',
          disabledFn: () => !this.dobleFactorForm.controls.code2FA.value
        }
      ]
    };
  }

  private initializeForm(): void {
    this.dobleFactorForm = this.fb.group({
      code2FA: ['']
    });
  }

  // private sendMail2FA(): void {
  //   this.userservice.sendUser2FA(this.userId).subscribe();
  // }

  private navToUpdate(): void {
    this.router.navigate(['/login/', RouteConstants.UPDATE_PASSWORD], {
      relativeTo: this.route
    });
  }
}
