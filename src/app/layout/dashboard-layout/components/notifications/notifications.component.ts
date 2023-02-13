import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
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
    filterByType: marker('common.filterByType'),
    CHANGE_STATE: marker('notifications.type.CHANGE_STATE'),
    EDIT_INFO: marker('notifications.type.EDIT_INFO'),
    NEW_CARD: marker('notifications.type.NEW_CARD'),
    END_WORK: marker('notifications.type.END_WORK'),
    ADD_COMMENT: marker('notifications.type.ADD_COMMENT'),
    ADD_DOC: marker('notifications.type.ADD_DOC'),
    ADD_MESSAGE_CLIENT: marker('notifications.type.ADD_MESSAGE_CLIENT')
  };
  public notifications: {
    new: NotificationDataListDTO[];
    old: NotificationDataListDTO[];
  } = {
    new: [],
    old: []
  };
  public loading = false;
  public types = new FormControl('');
  // public typesList: string[] = [
  //   'CHANGE_STATE',
  //   'EDIT_INFO',
  //   'NEW_CARD',
  //   'END_WORK',
  //   'ADD_COMMENT',
  //   'ADD_DOC',
  //   'ADD_MESSAGE_CLIENT'
  // ];
  public typesList: string[] = ['NEW_CARD', 'END_WORK', 'ADD_MESSAGE_CLIENT'];
  private originalNotifications: NotificationDataListDTO[] = [];
  private notificationFilter: NotificationFilterDTO = null;
  constructor(
    private authService: AuthenticationService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.notificationFilter = {
      userId: parseInt(this.authService.getUserId(), 10),
      readFilterType: 'NO_READ',
      notificationTypes: ['NEW_CARD', 'END_WORK', 'ADD_MESSAGE_CLIENT']
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
      .subscribe((data) => {
        this.originalNotifications = data;
        this.filterDataToShow();
      });
  }

  public goToCard(item: NotificationDataListDTO): void {
    let url = `${RouteConstants.DASHBOARD}/${RouteConstants.WORKFLOWS}/${item.workflowId}/`;
    if (this.router.url.indexOf(RouteConstants.WORKFLOWS_CALENDAR_VIEW) >= 0) {
      url += `${RouteConstants.WORKFLOWS_CALENDAR_VIEW}`;
    } else if (this.router.url.indexOf(RouteConstants.WORKFLOWS_TABLE_VIEW) >= 0) {
      url += `${RouteConstants.WORKFLOWS_TABLE_VIEW}`;
    } else {
      url += `${RouteConstants.WORKFLOWS_BOARD_VIEW}`;
    }
    url += `/(${RouteConstants.WORKFLOWS_CARD}:${RouteConstants.WORKFLOWS_ID_CARD}/${item.cardInstanceWorkflowId}/${
      RouteConstants.WORKFLOWS_ID_USER
    }/${item.workflowSubstateFront && item.userAsignId ? item.userAsignId : 'null'})`;
    this.router.navigateByUrl(url);
  }

  public filterDataToShow(): void {
    let filtered = [...this.originalNotifications];
    if (this.types.value.length > 0 && this.types.value.length !== this.typesList.length) {
      filtered = filtered.filter((item) => this.types.value.indexOf(item.notificationType.toString()) >= 0);
    }
    this.notifications.new = filtered.filter((d) => !d.read);
    this.notifications.old = filtered.filter((d) => d.read);
  }
}
