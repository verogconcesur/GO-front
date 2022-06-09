import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import { AuthenticationService } from '@app/security/authentication.service';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import UserDetailsDTO from '@data/models/user-details-dto';
import { UserService } from '@data/services/user.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { CustomDialogService } from '@shared/modules/custom-dialog/services/custom-dialog.service';
import { MyProfileComponent, MyProfileComponentModalEnum } from '@shared/components/app-user/my-profile/my-profile.component';
import { take } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

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
    private router: Router,
    private userService: UserService,
    private globalMessageService: GlobalMessageService,
    private authenticationService: AuthenticationService,
    private translateService: TranslateService,
    private customDialogService: CustomDialogService
  ) {}

  ngOnInit(): void {
    this.getUserDetails();
  }

  public getUserDetails(): void {
    const userId = Number(this.authenticationService.getUserId());

    this.userService.getUserDetailsById(userId).subscribe({
      next: (response) => {
        this.userDetails = response;
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

  public get showSpinner(): boolean {
    return !this.userDetails && !this.error;
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

  public doLogout(): void {
    this.authenticationService.logout();
    this.router.navigate([RouteConstants.LOGIN]);
  }
}
