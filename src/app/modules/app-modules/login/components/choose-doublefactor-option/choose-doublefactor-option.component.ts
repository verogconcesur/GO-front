import { Component, Inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '@app/security/authentication.service';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { UserService } from '@data/services/user.service';
import { CustomDialogFooterConfigI } from '@shared/modules/custom-dialog/interfaces/custom-dialog-footer-config';
import { ComponentToExtendForCustomDialog } from '@shared/modules/custom-dialog/models/component-for-custom-dialog';
import { CustomDialogService } from '@shared/modules/custom-dialog/services/custom-dialog.service';
import { Observable, of, take } from 'rxjs';
import { DoblefactorComponent, DobleFactorComponentModalEnum } from '../doblefactor/doblefactor.component';

export const enum ChooseDobleFactorOptionComponentModalEnum {
  ID = 'choose-doble-factor-dialog-id',
  PANEL_CLASS = 'choose-doble-factor-dialog',
  TITLE = 'Metodo de autenticacion'
}

@Component({
  selector: 'app-choose-doblefactor-option',
  templateUrl: './choose-doublefactor-option.component.html',
  styleUrls: ['./choose-doublefactor-option.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ChooseDoblefactorComponent extends ComponentToExtendForCustomDialog implements OnInit, OnDestroy {
  public labels = {
    title: marker('dobleFactor.title'),
    description: marker('dobleFactor.description'),
    code2FA: marker('dobleFactor.code2FA'),
    code2FAError: marker('dobleFactor.code2FAEror'),
    noCheck2FA: marker('dobleFactor.noCheck2FA'),
    send: marker('common.send')
  };

  public dobleFactorForm: UntypedFormGroup;
  public userId: number;
  public showNocheck = false;
  public isCheck = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public email: string;
  public phoneNumber: string;

  constructor(
    private fb: UntypedFormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private userservice: UserService,
    private customDialogService: CustomDialogService,
    private authenticationService: AuthenticationService,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    super(
      ChooseDobleFactorOptionComponentModalEnum.ID,
      ChooseDobleFactorOptionComponentModalEnum.PANEL_CLASS,
      ChooseDobleFactorOptionComponentModalEnum.TITLE
    );
  }

  ngOnInit(): void {
    this.userId = this.extendedComponentData.id;
    this.phoneNumber = this.extendedComponentData.phoneNumber;
    this.email = this.extendedComponentData.email;
  }

  ngOnDestroy(): void {}

  public confirmCloseCustomDialog(): Observable<boolean> {
    return of(true);
  }

  public selectOption = (type: 'SMS' | 'EMAIL' | 'AUTHENTICATOR'): void => {
    this.authenticationService
      .sendAuthentication(this.userId, type)
      .pipe(take(1))
      .subscribe((data) => {
        this.customDialogService
          .open({
            id: DobleFactorComponentModalEnum.ID,
            panelClass: DobleFactorComponentModalEnum.PANEL_CLASS,
            component: DoblefactorComponent,
            width: '500px',
            extendedComponentData: { data, type }
          })
          .pipe(take(1))
          .subscribe((response) => {
            if (response) {
              this.customDialogService.close(DobleFactorComponentModalEnum.ID);
            }
          });
      });
  };

  public onSubmitCustomDialog(): Observable<boolean> {
    return of(false);
  }

  public setAndGetFooterConfig(): CustomDialogFooterConfigI | null {
    return {
      show: true,
      leftSideButtons: [],
      rightSideButtons: []
    };
  }

  // private checkDueDatePassword(user: UserDTO): boolean {
  //   const sixMonthBeforeDate = new Date();
  //   sixMonthBeforeDate.setMonth(sixMonthBeforeDate.getMonth() - 6);
  //   return user.dueDatePass == null || user.dueDatePass < sixMonthBeforeDate ? false : true;
  // }

  // private navToUpdate(): void {
  //   this.router.navigate(['/login/', RouteConstants.UPDATE_PASSWORD], {
  //     relativeTo: this.route
  //   });
  // }
}
