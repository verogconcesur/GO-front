import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { Router } from '@angular/router';
import { ENV } from '@app/constants/global.constants';
import { ModulesConstants } from '@app/constants/modules.constants';
import { PermissionConstants } from '@app/constants/permission.constants';
import { RouteConstants } from '@app/constants/route.constants';
import { AuthenticationService } from '@app/security/authentication.service';
import { RxStompService } from '@app/services/rx-stomp.service';
import { Env } from '@app/types/env';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { AttachmentDTO } from '@data/models/cards/card-attachments-dto';
import NotificationFilterDTO from '@data/models/notifications/notification-filter-dto';
import WarningDTO from '@data/models/notifications/warning-dto';
import { AdvSearchService } from '@data/services/adv-search.service';
import { NotificationService } from '@data/services/notifications.service';
import { NewCardComponent, NewCardComponentModalEnum } from '@modules/feature-modules/new-card/new-card.component';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { NotificationSoundService } from '@shared/services/notification-sounds.service';
import { IMessage } from '@stomp/stompjs';
import saveAs from 'file-saver';
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
  @ViewChild('downloadTrigger') downloadTrigger: MatMenuTrigger;
  public readonly WORKFLOW_PATH = RouteConstants.WORKFLOWS;
  public readonly CLIENTS_PATH = RouteConstants.CUSTOMERS;
  public readonly VEHICLES_PATH = RouteConstants.VEHICLES;
  public readonly MENTIONS_PATH = RouteConstants.MENTIONS;
  public readonly NOTIFICATIONS_PATH = RouteConstants.NOTIFICATIONS;
  public readonly ADVANCED_SEARCH_PATH = RouteConstants.ADVANCED_SEARCH;
  public labels = {
    title: marker('app.title'),
    workflow: marker('app.menu.workflow'),
    clients: marker('app.menu.clients'),
    vehicles: marker('app.menu.vehicles'),
    advanceSearch: marker('app.menu.advanceSearch'),
    administration: marker('app.menu.administration'),
    createCard: marker('app.menu.createCard'),
    notifications: marker('common.notifications'),
    mentions: marker('common.mentions'),
    files: marker('common.files')
  };
  public infoWarning: WarningDTO = null;
  public interval: NodeJS.Timeout;
  public searchExportForm: FormArray;
  public intervalExport: NodeJS.Timeout;
  public unreadNotificationsCount = 0;
  public unreadMentionsCount = 0;
  private notificationFilter: NotificationFilterDTO = null;
  constructor(
    @Inject(ENV) private env: Env,
    private router: Router,
    public authService: AuthenticationService,
    public dialog: MatDialog,
    private notificationService: NotificationService,
    private notificationSoundService: NotificationSoundService,
    private rxStompService: RxStompService,
    private advSearchService: AdvSearchService,
    private fb: FormBuilder,
    private globalMessageService: GlobalMessageService,
    private translateService: TranslateService,
    private confirmationDialog: ConfirmDialogService
  ) {}

  ngOnInit(): void {
    this.notificationFilter = {
      userId: parseInt(this.authService.getUserId(), 10),
      readFilterType: 'NO_READ',
      notificationTypes: ['ADD_MESSAGE_CLIENT']
    };
    this.notificationService.unreadNotificationsCount$.pipe(untilDestroyed(this)).subscribe((count) => {
      this.unreadNotificationsCount = count;
    });
    this.notificationService.unreadMentionsCount$.pipe(untilDestroyed(this)).subscribe((count) => {
      this.unreadMentionsCount = count;
    });
    this.infoWarning = this.authService.getWarningStatus();
    this.initWarningInformationValue();
    this.initWebSocketForNotificationsAndMentions();
  }

  ngOnDestroy(): void {
    if (this.interval) {
      clearInterval(this.interval);
    }
    if (this.intervalExport) {
      clearInterval(this.intervalExport);
    }
  }

  public updateUnreadCount(warning: WarningDTO): void {
    this.notificationService.unreadMentionsCountSubject.next(warning.noReadMention);
    this.notificationService.unreadCountSubject.next(warning.noReadNotification);
  }
  public navigateToAdministration(): void {
    this.router.navigate([RouteConstants.ADMINISTRATION]);
  }

  public isAdvancedContractedModule(): boolean {
    const configList = this.authService.getConfigList();
    return configList.includes(ModulesConstants.ADVANCED_SEARCH);
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

  public showDownload(): void {
    this.infoWarning.newFileDownloading = false;
    this.authService.setWarningStatus(this.infoWarning);
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

  public highLightDownload(): boolean {
    return this.infoWarning.newFileDownloading;
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
  public downloadFile(fileAsyn: FormGroup): void {
    saveAs(this.getDataBase64(fileAsyn.value.attachment), fileAsyn.value.attachment.name);
  }
  public getDataBase64(attach: AttachmentDTO): string {
    return `data:${attach.type};base64,${attach.content}`;
  }

  public download(): void {}

  public markAllNotificationsAsRead = (): void => {
    this.confirmationDialog
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('common.markAsReadAllNotifications'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          this.notificationService
            .markAllNotificationsAsRead()
            .pipe(take(1))
            .subscribe({
              next: (response) => {
                this.globalMessageService.showSuccess({
                  message: this.translateService.instant(marker('common.successOperation')),
                  actionText: this.translateService.instant(marker('common.close'))
                });
                this.notificationService.resetUnreadCountNotifications();
              },
              error: (error) => {
                this.globalMessageService.showError({
                  message: error.message,
                  actionText: this.translateService.instant(marker('common.close'))
                });
              }
            });
        }
      });
  };

  public markAllMentionsAsRead = (): void => {
    this.confirmationDialog
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('common.markAsReadAllMentions'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          this.notificationService
            .markAllMentionsAsRead()
            .pipe(take(1))
            .subscribe({
              next: (response) => {
                this.globalMessageService.showSuccess({
                  message: this.translateService.instant(marker('common.successOperation')),
                  actionText: this.translateService.instant(marker('common.close'))
                });
                this.notificationService.resetUnreadCountMentions();
              },
              error: (error) => {
                this.globalMessageService.showError({
                  message: error.message,
                  actionText: this.translateService.instant(marker('common.close'))
                });
              }
            });
        }
      });
  };

  private initWarningInformationValue(): void {
    this.infoWarning = this.authService.getWarningStatus();
  }

  private initWebSocketForNotificationsAndMentions(): void {
    if (this.env.socketsEnabled) {
      this.rxStompService
        .watch('/topic/notification/' + this.authService.getUserId())
        .pipe(untilDestroyed(this))
        .subscribe((data: IMessage) => {
          this.getInfoWarnings();
        });
    } else {
      this.interval = setInterval(() => {
        this.getInfoWarnings();
      }, 60000);
    }
  }

  private getInfoWarnings(): void {
    this.notificationService
      .getInfoWarnings(this.infoWarning)
      .pipe(take(1))
      .subscribe((data) => {
        if (data?.newNoReadMention || data?.newNoReadNotification) {
          this.notificationSoundService.playSound('NOTIFICATION');
        }
        this.updateUnreadCount(data);
        this.infoWarning = {
          ...data,
          frontLastHeaderMentionOpenedTime: this.infoWarning.frontLastHeaderMentionOpenedTime,
          frontLastHeaderNotificationOpenedTime: this.infoWarning.frontLastHeaderNotificationOpenedTime
        };
        this.authService.setWarningStatus(data);
      });
  }
}
