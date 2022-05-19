import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import { AuthenticationService } from '@app/security/authentication.service';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import UserDetailsDTO from '@data/models/user-details-dto';
import { UserService } from '@data/services/user.service';
import { MyProfileComponent, MyProfileComponentModalEnum } from '@shared/components/app-user/my-profile/my-profile.component';
import { CustomDialogService } from '@shared/modules/custom-dialog/services/custom-dialog.service';
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
    records: marker('administration.records'),
    templates: marker('administration.templates'),
    title: marker('administration.title'),
    users: marker('administration.users'),
    viewProfile: marker('administration.viewProfile'),
    workflows: marker('administration.workflows')
  };

  public userDetails: UserDetailsDTO;

  constructor(
    private router: Router,
    private userService: UserService,
    private logger: NGXLogger,
    private globalMessageService: GlobalMessageService,
    private authenticationService: AuthenticationService,
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
        this.logger.error(error);

        this.globalMessageService.showError({
          message: error.message,
          actionText: 'Close'
        });
      }
    });
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
        disableClose: true
      })
      .pipe(take(1))
      .subscribe((response) => {
        if (response) {
          this.userDetails = response;
        }
      });
  }
}
