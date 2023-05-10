import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import { AuthenticationService } from '@app/security/authentication.service';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import UserDetailsDTO from '@data/models/user-permissions/user-details-dto';
import { UserService } from '@data/services/user.service';
import { TranslateService } from '@ngx-translate/core';
import { MyProfileComponent, MyProfileComponentModalEnum } from '@modules/feature-modules/my-profile-dialog/my-profile.component';
import { CustomDialogService } from '@jenga/custom-dialog';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { NGXLogger } from 'ngx-logger';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-administration-layout',
  templateUrl: './administration-layout.component.html',
  styleUrls: ['./administration-layout.component.scss']
})
export class AdministrationLayoutComponent implements OnInit {
  public labels = {
    exit: marker('administration.exit'),
    organization: marker('administration.organization'),
    brands: marker('administration.brands'),
    facilities: marker('administration.facilities'),
    records: marker('administration.records'),
    templates: marker('administration.templates.title'),
    title: marker('administration.title'),
    users: marker('administration.users'),
    viewProfile: marker('administration.viewProfile'),
    workflows: marker('administration.workflows')
  };
  public filterDrawerDisableClose = false;

  public readonly USERS_TEMPLATE_PATH = RouteConstants.USERS;
  public readonly ORGANIZATION_TEMPLATE_PATH = RouteConstants.ORGANIZATION;
  public readonly BRANDS_TEMPLATE_PATH = `${RouteConstants.ORGANIZATION}/${RouteConstants.BRANDS}`;
  public readonly FACILITIES_TEMPLATE_PATH = `${RouteConstants.ORGANIZATION}/${RouteConstants.FACILITIES}`;
  public readonly TEMPLATES_PATH = RouteConstants.TEMPLATES;
  public readonly CARDS_PATH = RouteConstants.CARDS;
  public readonly WORKFLOWS_PATH = RouteConstants.ADM_WORKFLOWS;

  public userDetails: UserDetailsDTO;

  constructor(
    private router: Router,
    private userService: UserService,
    private logger: NGXLogger,
    private translateService: TranslateService,
    private globalMessageService: GlobalMessageService,
    private authenticationService: AuthenticationService,
    private customDialogService: CustomDialogService
  ) {}

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
            this.logger.error(error);

            this.globalMessageService.showError({
              message: error.message,
              actionText: this.translateService.instant(marker('common.close'))
            });
          }
        });
    }
  }

  public exitAdministration(): void {
    this.router.navigate(['/', RouteConstants.DASHBOARD]);
  }

  public viewMyProfile(): void {
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
}
