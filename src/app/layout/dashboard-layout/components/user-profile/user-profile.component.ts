import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import { AuthenticationService } from '@app/security/authentication.service';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import UserDetailsDTO from '@data/models/user-permissions/user-details-dto';
import { UserService } from '@data/services/user.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { CustomDialogService } from '@frontend/custom-dialog';
import { MyProfileComponent, MyProfileComponentModalEnum } from '@modules/feature-modules/my-profile-dialog/my-profile.component';
import { take } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { ENV } from '@app/constants/global.constants';
import { Env } from '@app/types/env';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  public labels = {
    logout: marker('logout.logout'),
    title: marker('userProfile.title'),
    name: marker('userProfile.name'),
    lastName: marker('userProfile.lastName'),
    email: marker('userProfile.email'),
    role: marker('userProfile.role'),
    nick: marker('userProfile.nick'),
    organization: marker('userProfile.organization'),
    edit: marker('userProfile.edit'),
    sign: marker('userProfile.sign'),
    data: marker('userProfile.data'),
    brand: marker('userProfile.brand'),
    facility: marker('userProfile.facility'),
    department: marker('userProfile.department'),
    specialty: marker('userProfile.specialty')
  };

  public panelDataOpenState = false;
  public panelOrganizationOpenState = false;
  public panelSignOpenState = false;
  public userDetails: UserDetailsDTO;
  public error: ConcenetError;

  constructor(
    @Inject(ENV) private env: Env,
    private router: Router,
    private userService: UserService,
    private globalMessageService: GlobalMessageService,
    private authenticationService: AuthenticationService,
    private translateService: TranslateService,
    private customDialogService: CustomDialogService
  ) {}

  public get showSpinner(): boolean {
    return !this.userDetails && !this.error;
  }

  public get appVersion(): string {
    if (this.env.appVersion.includes('-')) {
      return `v${this.env.appVersion.split('-')[0]}`;
    }
    return `v${this.env.appVersion}`;
  }

  ngOnInit(): void {
    this.getUserDetails();
  }

  public getUserDetails(): void {
    const userId = Number(this.authenticationService.getUserId());
    this.userDetails = this.userService.userLogged$.value;
    if (!this.userDetails) {
      this.userService
        .getUserDetailsById(userId)
        .pipe(take(1))
        .subscribe({
          next: (response) => {
            this.userDetails = response;
            this.userService.userLogged$.next(response);
          },
          error: (error: ConcenetError) => {
            this.error = error;

            this.globalMessageService.showError({
              message: this.error.message,
              actionText: this.translateService.instant(marker('common.close'))
            });
          }
        });
    }
  }
  public showEditProfileDialog(): void {
    this.customDialogService
      .open({
        component: MyProfileComponent,
        extendedComponentData: this.userDetails,
        id: MyProfileComponentModalEnum.ID,
        panelClass: MyProfileComponentModalEnum.PANEL_CLASS,
        disableClose: true,
        width: '700px'
      })
      .pipe(take(1))
      .subscribe((response) => {
        if (response) {
          this.userDetails = response;
        }
      });
  }

  public getSignBase64Image(): string {
    if (this.userDetails?.signature && this.userDetails?.signatureContentType) {
      return `url("data:${this.userDetails.signatureContentType} ;base64,${this.userDetails.signature}")`;
    }
    return '';
  }

  public doLogout(): void {
    this.authenticationService.logout();
    this.router.navigate([RouteConstants.LOGIN]);
  }
}
