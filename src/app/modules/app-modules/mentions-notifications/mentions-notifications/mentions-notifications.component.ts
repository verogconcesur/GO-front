import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import MentionDataListDTO from '@data/models/notifications/mention-data-list-dto';
import NotificationDataListDTO from '@data/models/notifications/notification-data-list-dto';
import { Observable, of } from 'rxjs';
// eslint-disable-next-line max-len
import { MentionsNotificationsHeaderComponent } from '../components/mentions-notifications-header/mentions-notifications-header.component';
import { MentionsComponent } from '../components/mentions/mentions.component';
import { NotificationsComponent } from '../components/notifications/notifications.component';

@Component({
  selector: 'app-mentions-notifications',
  templateUrl: './mentions-notifications.component.html',
  styleUrls: ['./mentions-notifications.component.scss']
})
export class MentionsNotificationsComponent implements OnInit {
  @ViewChild('mentions') mentionsComponent: MentionsComponent;
  @ViewChild('notifications') notificationsComponent: NotificationsComponent;
  @ViewChild('mnHeader') mnHeader: MentionsNotificationsHeaderComponent;
  public labels = {
    notifications: marker('common.notifications'),
    mentions: marker('common.mentions')
  };
  public selectedTab: 'notifications' | 'mentions' = 'notifications';
  private lastFilterSearch: string;

  constructor(private router: Router) {}

  ngOnInit(): void {
    if (this.router.url.indexOf(RouteConstants.MENTIONS) > -1) {
      this.selectedTab = 'mentions';
    }
  }
  public areFiltersSettedAndActive(): boolean {
    if (this.selectedTab === 'notifications') {
      return this.notificationsComponent?.areFiltersSettedAndActive();
    } else {
      return this.mentionsComponent?.areFiltersSettedAndActive();
    }
  }
  public areSearchActive(): boolean {
    if (this.selectedTab === 'notifications') {
      return false;
    } else {
      return true;
    }
  }
  public getSelectedTabIndex(): number {
    switch (this.selectedTab) {
      case 'notifications':
        return 0;
      case 'mentions':
        return 1;
    }
  }
  public getFilteredData = (text: string): Observable<{ content: NotificationDataListDTO[] | MentionDataListDTO[] } | null> => {
    if (this.selectedTab === 'notifications') {
      return this.notificationsComponent.getFilteredData(text);
    } else {
      return this.mentionsComponent.getFilteredData(text);
    }
  };

  public buttonShowFilterDrawerAction(): void {
    if (this.selectedTab === 'notifications') {
      this.notificationsComponent.openFilterDialog();
    } else {
      this.mentionsComponent.openFilterDialog();
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public buttonSearchAction(option: any): void {
    this.lastFilterSearch = option;
    if (this.selectedTab === 'mentions') {
      return this.mentionsComponent.showFilterOptionSelected(option);
    }
  }
  public changeSelectedTab(tab: MatTabChangeEvent): void {
    // this.mnHeader?.resetFilter();
    if (this.lastFilterSearch) {
      this.buttonSearchAction(null);
    }
    if (tab.index === 0) {
      this.selectedTab = 'notifications';
    } else {
      this.selectedTab = 'mentions';
    }
  }
}
