import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import { MentionsComponent } from '../mentions/mentions.component';
import { NotificationsComponent } from '../notifications/notifications.component';

@UntilDestroy()
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  @ViewChild('notifications') notifications: NotificationsComponent;
  @ViewChild('mentions') mentions: MentionsComponent;
  public readonly WORKFLOW_PATH = RouteConstants.WORKFLOWS;
  public readonly CLIENTS_PATH = RouteConstants.CUSTOMERS;
  public readonly VEHICLES_PATH = RouteConstants.VEHICLES;
  public readonly MENTIONS_PATH = RouteConstants.MENTIONS;
  public readonly NOTIFICATIONS_PATH = RouteConstants.NOTIFICATIONS;
  public labels = {
    title: marker('app.title'),
    workflow: marker('app.menu.workflow'),
    clients: marker('app.menu.clients'),
    vehicles: marker('app.menu.vehicles'),
    advanceSearch: marker('app.menu.advanceSearch'),
    administration: marker('app.menu.administration'),
    createCard: marker('app.menu.createCard'),
    notifications: marker('common.notifications'),
    mentions: marker('common.mentions')
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
    this.infoWarning = this.authService.getWarningStatus();
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
          if (data?.newNoReadMention || data?.newNoReadNotification) {
            this.notificationSoundService.playSound('NOTIFICATION');
          }
          this.infoWarning = {
            ...data,
            frontLastHeaderMentionOpenedTime: this.infoWarning.frontLastHeaderMentionOpenedTime,
            frontLastHeaderNotificationOpenedTime: this.infoWarning.frontLastHeaderNotificationOpenedTime
          };
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
    this.infoWarning.newNoReadMention = false;
    this.infoWarning.frontLastHeaderMentionOpenedTime = this.infoWarning.lastDateNoReadMention;
    this.authService.setWarningStatus(this.infoWarning);
    this.mentions.getData();
  }

  public showNotifications(): void {
    this.infoWarning.newNoReadNotification = false;
    this.infoWarning.frontLastHeaderNotificationOpenedTime = this.infoWarning.lastDateNoReadNotification;
    this.authService.setWarningStatus(this.infoWarning);
    this.notifications.getData();
  }

  public highLightNotifications(): boolean {
    return (
      this.infoWarning.newNoReadNotification ||
      (this.infoWarning.existsNoReadNotification &&
        this.infoWarning.frontLastHeaderNotificationOpenedTime !== this.infoWarning.lastDateNoReadNotification)
    );
  }

  public highLightMentions(): boolean {
    return (
      this.infoWarning.newNoReadMention ||
      (this.infoWarning.existsNoReadMention &&
        this.infoWarning.frontLastHeaderMentionOpenedTime !== this.infoWarning.lastDateNoReadMention)
    );
  }

  private initWarningInformationValue(): void {
    this.infoWarning = this.authService.getWarningStatus();
  }
}
