/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import TemplatesFilterDTO from '@data/models/templates/templates-filter-dto';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
// eslint-disable-next-line max-len
import { AdministrationCommonHeaderSectionClassToExtend } from '@modules/feature-modules/administration-common-header-section/administration-common-header-section-class-to-extend';
// eslint-disable-next-line max-len
import { ModulesConstants } from '@app/constants/modules.constants';
import { AuthenticationService } from '@app/security/authentication.service';
// eslint-disable-next-line max-len
import { AdministrationCommonHeaderSectionComponent } from '@modules/feature-modules/administration-common-header-section/administration-common-header-section.component';
import { FilterDrawerService } from '@modules/feature-modules/filter-drawer/services/filter-drawer.service';
import { Observable } from 'rxjs';
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
    | RouteConstants.CLIENT_TIMELINE
    | RouteConstants.ACCOUNTING = RouteConstants.COMMUNICATIONS;

  public labels = {
    title: marker('administration.templates.title'),
    communication: marker('administration.templates.communications.title'),
    budgets: marker('administration.templates.budgets.title'),
    checklists: marker('administration.templates.checklists.title'),
    attachments: marker('administration.templates.attachments.title'),
    clientTimeline: marker('administration.templates.clientTimeline.title'),
    accounting: marker('administration.templates.accounting.title'),
    createCommunication: marker('administration.templates.communications.create'),
    createBudgets: marker('administration.templates.budgets.create'),
    createChecklists: marker('administration.templates.checklists.create'),
    createAttachments: marker('administration.templates.attachments.create'),
    createClientTimeline: marker('administration.templates.clientTimeline.create'),
    createAccounting: marker('administration.templates.accounting.create'),
    create: marker('common.create')
  };
  public tabs: { route: string; label: string }[] = [];

  private lastFilterSearch: string;
  private filterValue: TemplatesFilterDTO;
  private routerComponent: AdministrationCommonHeaderSectionClassToExtend;
  private configList: string[] = [];

  constructor(
    private router: Router,
    private filterDrawerService: FilterDrawerService,
    private authService: AuthenticationService
  ) {}

  ngOnInit(): void {
    this.configList = this.authService.getConfigList();
    this.setTabsToShow();
    this.setSidenavFilterDrawerConfiguration();
  }

  public getSearchType(): 'search' | 'filter' {
    return 'search';
  }

  public isContractedModule(option: string): boolean {
    if (option === 'checklist') {
      return this.configList.includes(ModulesConstants.CHECK_LIST);
    } else if (option === 'accounting') {
      return this.configList.includes(ModulesConstants.ACCOUNTING);
    } else if (option === 'timeline') {
      return this.configList.includes(ModulesConstants.TIME_LINE);
    } else if (option === 'budget') {
      return this.configList.includes(ModulesConstants.BUDGET);
    }
    return true;
  }

  public getSelectedTabIndex(): number {
    this.setSelectedTab();
    return this.tabs.findIndex((tab) => tab.route === this.selectedTab);
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
      case RouteConstants.ACCOUNTING:
        return type && type === 'small' ? this.labels.create : this.labels.createAccounting;
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
      console.log('lastFilterSearch todo?', this.lastFilterSearch);
      // this.buttonSearchAction(null);
    }
    const tabSelected = this.tabs[tab.index];
    this.selectedTab = tabSelected.route as any;
    this.router.navigate([RouteConstants.ADMINISTRATION, RouteConstants.TEMPLATES, tabSelected.route]);
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
    } else if (url.indexOf(RouteConstants.ACCOUNTING) > 0) {
      this.selectedTab = RouteConstants.ACCOUNTING;
    }
  }

  private setSidenavFilterDrawerConfiguration = () => {
    //If we need a special filter for any tab we must create it in each component
    this.filterDrawerService.setComponentToShowInsideFilterDrawer(TemplatesFilterComponent, this.filterValue);
    this.filterDrawerService.filterValueSubject$.pipe(untilDestroyed(this)).subscribe((filterValue: TemplatesFilterDTO) => {
      this.filterValue = filterValue;
    });
  };

  private setTabsToShow(): void {
    this.tabs = [{ label: this.labels.communication, route: RouteConstants.COMMUNICATIONS }];
    if (this.isContractedModule('budget')) {
      this.tabs.push({ label: this.labels.budgets, route: RouteConstants.BUDGETS });
    }
    if (this.isContractedModule('checklist')) {
      this.tabs.push({ label: this.labels.checklists, route: RouteConstants.CHECKLISTS });
    }
    if (this.isContractedModule('attachment')) {
      this.tabs.push({ label: this.labels.attachments, route: RouteConstants.ATTACHMENTS });
    }
    if (this.isContractedModule('timeline')) {
      this.tabs.push({ label: this.labels.clientTimeline, route: RouteConstants.CLIENT_TIMELINE });
    }
    if (this.isContractedModule('accounting')) {
      this.tabs.push({ label: this.labels.accounting, route: RouteConstants.ACCOUNTING });
    }
  }
}
