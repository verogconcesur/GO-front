import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AuthenticationService } from '@app/security/authentication.service';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import NotificationDataListDTO from '@data/models/notifications/notification-data-list-dto';
import NotificationFilterDTO from '@data/models/notifications/notification-filter-dto';
import { NotificationService } from '@data/services/notifications.service';
import { finalize, take } from 'rxjs/operators';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NotificationsComponent implements OnInit {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public labels: any = {
    newNotifications: marker('common.unread'),
    oldNotifications: marker('common.readen'),
    noDataToShow: marker('errors.noDataToShow'),
    filterByType: marker('common.filterByType'),
    CHANGE_STATE: marker('notifications.type.CHANGE_STATE'),
    EDIT_INFO: marker('notifications.type.EDIT_INFO'),
    ASIG_USER: marker('notifications.type.ASIG_USER'),
    END_WORK: marker('notifications.type.END_WORK'),
    ADD_COMMENT: marker('notifications.type.ADD_COMMENT'),
    ADD_DOC: marker('notifications.type.ADD_DOC'),
    ADD_MESSAGE_CLIENT: marker('notifications.type.ADD_MESSAGE_CLIENT')
  };
  public notifications: NotificationDataListDTO[] = [];
  public loading = false;
  public types = new FormControl('');
  // public typesList: string[] = [
  //   'CHANGE_STATE',
  //   'EDIT_INFO',
  //   'ASIG_USER',
  //   'END_WORK',
  //   'ADD_COMMENT',
  //   'ADD_DOC',
  //   'ADD_MESSAGE_CLIENT'
  // ];
  // ['ASIG_USER', 'END_WORK', 'ADD_MESSAGE_CLIENT'];
  public typesList: string[] = ['ADD_MESSAGE_CLIENT'];
  private originalNotifications: NotificationDataListDTO[] = [];
  private notificationFilter: NotificationFilterDTO = null;
  constructor(
    private authService: AuthenticationService,
    private notificationService: NotificationService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.notificationFilter = {
      userId: parseInt(this.authService.getUserId(), 10),
      readFilterType: 'NO_READ',
      // ['ASIG_USER', 'END_WORK', 'ADD_MESSAGE_CLIENT']
      notificationTypes: ['ADD_MESSAGE_CLIENT']
    };
  }

  public getData(): void {
    this.loading = true;
    this.notificationService
      .getNotifications(this.notificationFilter)
      .pipe(
        take(1),
        finalize(() => (this.loading = false))
      )
      .subscribe((data: NotificationDataListDTO[]) => {
        this.originalNotifications = data;
        this.filterDataToShow();
      });
  }

  public getNotificationInfo(item: NotificationDataListDTO): string {
    return `${this.datePipe.transform(new Date(item.dateNotification), 'dd-MM-yyyy, HH:mm')}: ${item.notification}`;
  }

  public getItemIcon(item: NotificationDataListDTO): string {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    switch (item.notificationType as any) {
      case 'CHANGE_STATE':
        return 'redo';
      case 'EDIT_INFO':
        return 'edit';
      case 'ASIG_USER':
        return 'fiber_new';
      case 'END_WORK':
        return 'done_all';
      case 'ADD_COMMENT':
        return 'insert_comment';
      case 'ADD_DOC':
        return 'attach_file';
      case 'ADD_MESSAGE_CLIENT':
        return 'record_voice_over';
      default:
        return '';
    }
  }

  public markAsViewed(item: NotificationDataListDTO): void {
    this.loading = true;
    this.notificationService
      .markNotificationAsRead(item.id)
      .pipe(
        take(1),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe((data) => {
        this.getData();
      });
  }

  public filterDataToShow(): void {
    let filtered = [...this.originalNotifications];
    if (this.types.value.length > 0 && this.types.value.length !== this.typesList.length) {
      filtered = filtered.filter((item) => this.types.value.indexOf(item.notificationType.toString()) >= 0);
    }
    this.notifications = filtered;
  }
}
