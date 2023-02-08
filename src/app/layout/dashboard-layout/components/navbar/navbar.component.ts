import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PermissionConstants } from '@app/constants/permission.constants';
import { RouteConstants } from '@app/constants/route.constants';
import { AuthenticationService } from '@app/security/authentication.service';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import WarningDTO from '@data/models/notifications/warning-dto';
import { NotificationService } from '@data/services/notifications.service';
import { NewCardComponent, NewCardComponentModalEnum } from '@modules/feature-modules/new-card/new-card.component';
import { UntilDestroy } from '@ngneat/until-destroy';
import { NotificationSoundService } from '@shared/services/notification-sounds.service';
import { take } from 'rxjs/operators';

@UntilDestroy()
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  public readonly WORKFLOW_PATH = RouteConstants.WORKFLOWS;
  public readonly CLIENTS_PATH = RouteConstants.CUSTOMERS;
  public readonly VEHICLES_PATH = RouteConstants.VEHICLES;
  public labels = {
    title: marker('app.title'),
    workflow: marker('app.menu.workflow'),
    clients: marker('app.menu.clients'),
    vehicles: marker('app.menu.vehicles'),
    advanceSearch: marker('app.menu.advanceSearch'),
    administration: marker('app.menu.administration'),
    createCard: marker('app.menu.createCard')
  };
  public infoWarning: WarningDTO = null;
  private readonly notificationTimeInterval = 20000;
  private interval: NodeJS.Timeout;

  constructor(
    private router: Router,
    private authService: AuthenticationService,
    public dialog: MatDialog,
    private notificationService: NotificationService,
    private notificationSoundService: NotificationSoundService
  ) {}

  ngOnInit(): void {
    this.initWarningInformationValue();
    this.initWarningNotificationInterval();
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
    this.interval = null;
  }

  public initWarningNotificationInterval(): void {
    this.interval = setInterval(() => {
      this.notificationService
        .getInfoWarnings(this.infoWarning)
        .pipe(take(1))
        .subscribe((data) => {
          if (
            (data?.existsNoReadMention && data.lastDateNoReadMention !== this.infoWarning.lastDateNoReadMention) ||
            (data?.existsNoReadNotification && data.lastDateNoReadNotification !== this.infoWarning.lastDateNoReadNotification)
          ) {
            this.notificationSoundService.playSound('NOTIFICATION');
          }
          this.infoWarning = data;
          this.authService.setWarningStatus(data);
        });
    }, this.notificationTimeInterval);
  }

  public navigateToAdministration(): void {
    this.router.navigate([RouteConstants.ADMINISTRATION]);
  }

  public isAdmin(): boolean {
    return this.authService.hasUserAnyPermission([PermissionConstants.ISADMIN]);
  }

  public openNewCardDialog(): void {
    this.dialog.open(NewCardComponent, {
      width: '80%',
      height: '80%',
      panelClass: NewCardComponentModalEnum.PANEL_CLASS,
      disableClose: true
    });
  }

  public showMentions(): void {
    this.infoWarning.existsNoReadMention = false;
  }

  public showNotifications(): void {
    this.infoWarning.existsNoReadNotification = false;
  }

  private initWarningInformationValue(): void {
    this.infoWarning = this.authService.getWarningStatus();
  }
}
