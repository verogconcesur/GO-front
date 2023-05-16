import { Component, OnInit } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  public selectedTab:
    | RouteConstants.ADM_LANDING_GLOBAL_CONFIG
    | RouteConstants.ADM_LANDING_LINKS_CONFIG
    | RouteConstants.ADM_LANDING_BANNERS_CONFIG = RouteConstants.ADM_LANDING_GLOBAL_CONFIG;
  public labels = {
    layoutTitle: marker('landing.title'),
    config: marker('landing.config'),
    links: marker('landing.links'),
    banners: marker('landing.banners')
  };
  constructor(private router: Router) {}

  ngOnInit(): void {}

  public getSelectedTabIndex(): number {
    this.setSelectedTab();
    switch (this.selectedTab) {
      case RouteConstants.ADM_LANDING_GLOBAL_CONFIG:
        return 0;
      case RouteConstants.ADM_LANDING_LINKS_CONFIG:
        return 1;
      case RouteConstants.ADM_LANDING_BANNERS_CONFIG:
        return 2;
    }
  }

  public changeSelectedTab(tab: MatTabChangeEvent): void {
    switch (tab.index) {
      case 0:
        this.selectedTab = RouteConstants.ADM_LANDING_GLOBAL_CONFIG;
        // eslint-disable-next-line max-len
        this.router.navigate([
          RouteConstants.ADMINISTRATION,
          RouteConstants.ADM_LANDING,
          RouteConstants.ADM_LANDING_GLOBAL_CONFIG
        ]);
        break;
      case 1:
        this.selectedTab = RouteConstants.ADM_LANDING_LINKS_CONFIG;
        this.router.navigate([
          RouteConstants.ADMINISTRATION,
          RouteConstants.ADM_LANDING,
          RouteConstants.ADM_LANDING_LINKS_CONFIG
        ]);
        break;
      case 2:
        this.selectedTab = RouteConstants.ADM_LANDING_BANNERS_CONFIG;
        this.router.navigate([
          RouteConstants.ADMINISTRATION,
          RouteConstants.ADM_LANDING,
          RouteConstants.ADM_LANDING_BANNERS_CONFIG
        ]);
        break;
      default:
        this.selectedTab = RouteConstants.ADM_LANDING_GLOBAL_CONFIG;
        this.router.navigate([
          RouteConstants.ADMINISTRATION,
          RouteConstants.ADM_LANDING,
          RouteConstants.ADM_LANDING_GLOBAL_CONFIG
        ]);
    }
  }

  private setSelectedTab() {
    const url = this.router.url;
    if (url.indexOf(RouteConstants.ADM_LANDING_GLOBAL_CONFIG) > 0) {
      this.selectedTab = RouteConstants.ADM_LANDING_GLOBAL_CONFIG;
    } else if (url.indexOf(RouteConstants.ADM_LANDING_LINKS_CONFIG) > 0) {
      this.selectedTab = RouteConstants.ADM_LANDING_LINKS_CONFIG;
    } else if (url.indexOf(RouteConstants.ADM_LANDING_BANNERS_CONFIG) > 0) {
      this.selectedTab = RouteConstants.ADM_LANDING_BANNERS_CONFIG;
    }
  }
}
