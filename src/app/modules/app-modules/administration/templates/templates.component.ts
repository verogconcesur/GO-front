/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import TemplatesFilterDTO from '@data/models/templates-filter-dto';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
// eslint-disable-next-line max-len
import { AdministrationCommonHeaderSectionClassToExtend } from '@modules/feature-modules/administration-common-header-section/administration-common-header-section-class-to-extend';
// eslint-disable-next-line max-len
import { AdministrationCommonHeaderSectionComponent } from '@modules/feature-modules/administration-common-header-section/administration-common-header-section.component';
import { FilterDrawerService } from '@modules/feature-modules/filter-drawer/services/filter-drawer.service';
import { Observable, of } from 'rxjs';
import { TemplatesFilterComponent } from './components/templates-filter/templates-filter.component';

@UntilDestroy()
@Component({
  selector: 'app-templates',
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.scss']
})
export class TemplatesComponent implements OnInit {
  @ViewChild('templatesHeader') templatesHeader: AdministrationCommonHeaderSectionComponent;
  public selectedTab:
    | RouteConstants.COMMUNICATIONS
    | RouteConstants.BUDGETS
    | RouteConstants.CHECKLISTS
    | RouteConstants.ATTACHMENTS
    | RouteConstants.CLIENT_TIMELINE = RouteConstants.COMMUNICATIONS;

  public labels = {
    title: marker('administration.templates.title'),
    communication: marker('administration.templates.communications.title'),
    budgets: marker('administration.templates.budgets.title'),
    checklists: marker('administration.templates.checklists.title'),
    attachments: marker('administration.templates.attachments.title'),
    clientTimeline: marker('administration.templates.clientTimeline.title'),
    createCommunication: marker('administration.templates.communications.create'),
    createBudgets: marker('administration.templates.budgets.create'),
    createChecklists: marker('administration.templates.checklists.create'),
    createAttachments: marker('administration.templates.attachments.create'),
    createClientTimeline: marker('administration.templates.clientTimeline.create'),
    create: marker('common.create')
  };

  private lastFilterSearch: string;
  private filterValue: TemplatesFilterDTO;
  private routerComponent: AdministrationCommonHeaderSectionClassToExtend;

  constructor(private router: Router, private filterDrawerService: FilterDrawerService) {}

  ngOnInit(): void {
    this.setSidenavFilterDrawerConfiguration();
  }

  public getSearchType(): 'search' | 'filter' {
    return 'search';
  }

  public getSelectedTabIndex(): number {
    this.setSelectedTab();
    switch (this.selectedTab) {
      case RouteConstants.COMMUNICATIONS:
        return 0;
      case RouteConstants.BUDGETS:
        return 1;
      case RouteConstants.CHECKLISTS:
        return 2;
      case RouteConstants.ATTACHMENTS:
        return 3;
      case RouteConstants.CLIENT_TIMELINE:
        return 4;
    }
  }

  public getHeaderCreateButtonLabel(type?: 'small'): string {
    switch (this.selectedTab) {
      case RouteConstants.COMMUNICATIONS:
        return type && type === 'small' ? this.labels.create : this.labels.createCommunication;
      case RouteConstants.BUDGETS:
        return type && type === 'small' ? this.labels.create : this.labels.createBudgets;
      case RouteConstants.CHECKLISTS:
        return type && type === 'small' ? this.labels.create : this.labels.createChecklists;
      case RouteConstants.ATTACHMENTS:
        return type && type === 'small' ? this.labels.create : this.labels.createAttachments;
      case RouteConstants.CLIENT_TIMELINE:
        return type && type === 'small' ? this.labels.create : this.labels.createClientTimeline;
    }
  }

  public onActivate(componentRef: AdministrationCommonHeaderSectionClassToExtend) {
    this.routerComponent = componentRef;
  }

  public buttonCreateAction(): void {
    this.routerComponent.headerCreateAction();
  }

  public getFilteredData = (text: string): Observable<{ content: any[]; optionLabelFn: (option: any) => string } | null> =>
    this.routerComponent.headerGetFilteredData(text);

  public buttonShowFilterDrawerAction(): void {
    this.filterDrawerService.toggleFilterDrawer();
    //If filter is common for all tabs, it's not necessary to implement it in each component
    // this.routerComponent.headerShowFilterDrawerAction();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public buttonSearchAction(option: any): void {
    this.lastFilterSearch = option;
    this.routerComponent.headerSearchAction(option);
  }

  public changeSelectedTab(tab: MatTabChangeEvent): void {
    this.templatesHeader?.resetFilter();
    if (this.lastFilterSearch) {
      console.log('Anything to do?', this.lastFilterSearch);
      // this.buttonSearchAction(null);
    }
    switch (tab.index) {
      case 1:
        this.selectedTab = RouteConstants.BUDGETS;
        this.router.navigate([RouteConstants.ADMINISTRATION, RouteConstants.TEMPLATES, RouteConstants.BUDGETS]);
        break;
      case 2:
        this.selectedTab = RouteConstants.CHECKLISTS;
        this.router.navigate([RouteConstants.ADMINISTRATION, RouteConstants.TEMPLATES, RouteConstants.CHECKLISTS]);
        break;
      case 3:
        this.selectedTab = RouteConstants.ATTACHMENTS;
        this.router.navigate([RouteConstants.ADMINISTRATION, RouteConstants.TEMPLATES, RouteConstants.ATTACHMENTS]);
        break;
      case 4:
        this.selectedTab = RouteConstants.CLIENT_TIMELINE;
        this.router.navigate([RouteConstants.ADMINISTRATION, RouteConstants.TEMPLATES, RouteConstants.CLIENT_TIMELINE]);
        break;
      default:
        this.selectedTab = RouteConstants.COMMUNICATIONS;
        this.router.navigate([RouteConstants.ADMINISTRATION, RouteConstants.TEMPLATES, RouteConstants.COMMUNICATIONS]);
    }
  }

  public areFiltersSettedAndActive(): boolean {
    return (
      this.filterValue?.brands?.length > 0 ||
      this.filterValue?.departments?.length > 0 ||
      this.filterValue?.facilities?.length > 0 ||
      this.filterValue?.specialties?.length > 0
    );
    //If filter is common for all tabs, it's not necessary to implement it in each component
    // return this.routerComponent.headerAreFiltersSettedAndActive();
  }

  private setSelectedTab() {
    const url = this.router.url;
    if (url.indexOf(RouteConstants.COMMUNICATIONS) > 0) {
      this.selectedTab = RouteConstants.COMMUNICATIONS;
    } else if (url.indexOf(RouteConstants.BUDGETS) > 0) {
      this.selectedTab = RouteConstants.BUDGETS;
    } else if (url.indexOf(RouteConstants.CHECKLISTS) > 0) {
      this.selectedTab = RouteConstants.CHECKLISTS;
    } else if (url.indexOf(RouteConstants.ATTACHMENTS) > 0) {
      this.selectedTab = RouteConstants.ATTACHMENTS;
    } else if (url.indexOf(RouteConstants.CLIENT_TIMELINE) > 0) {
      this.selectedTab = RouteConstants.CLIENT_TIMELINE;
    }
  }

  private setSidenavFilterDrawerConfiguration = () => {
    //If we need a special filter for any tab we must create it in each component
    this.filterDrawerService.setComponentToShowInsideFilterDrawer(TemplatesFilterComponent, this.filterValue);
    this.filterDrawerService.filterValueSubject$.pipe(untilDestroyed(this)).subscribe((filterValue: TemplatesFilterDTO) => {
      this.filterValue = filterValue;
    });
  };
}
