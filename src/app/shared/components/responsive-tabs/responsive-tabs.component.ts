import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output,
  QueryList,
  SimpleChanges,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { WorkflowRequiredFieldsAuxService } from '@modules/app-modules/workflow/aux-service/workflow-required-fields-aux.service';
import { TranslateService } from '@ngx-translate/core';

export interface ResponsiveTabI {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  id: any;
  label: string;
  newData?: boolean;
  disabled?: () => boolean;
  disabledTooltip?: string;
  colId?: number;
}

@Component({
  selector: 'app-responsive-tabs',
  templateUrl: './responsive-tabs.component.html',
  styleUrls: ['./responsive-tabs.component.scss']
})
export class ResponsiveTabsComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild('responsiveTabsWrapper') responsiveTabsWrapper: ElementRef;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @ViewChildren('responsiveTab', { read: ElementRef }) responsiveTab: QueryList<ElementRef>;
  @Input() tabs: ResponsiveTabI[];
  @Input() tabSelectedId: string;
  @Output() tabSelectedEvent: EventEmitter<ResponsiveTabI> = new EventEmitter();
  public readonly tabKey = 'tab-';
  public labels = {
    more: marker('common.more')
  };
  public tabSelected: ResponsiveTabI = null;
  public visibleTabs: ResponsiveTabI[] = [];
  public hiddenTabs: ResponsiveTabI[] = [];
  public showMoreButton = false;
  public calculatingTabsWidth = false;

  constructor(public requiredFieldsAuxService: WorkflowRequiredFieldsAuxService, private translateService: TranslateService) {}

  @HostListener('window:resize', ['$event']) onResize(event: { target: { innerWidth: number } }) {
    this.calculateTabsWidth();
  }

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.tabs) {
      this.initTabs();
    }
  }

  ngAfterViewInit(): void {
    this.calculateTabsWidth();
  }

  public initTabs(): void {
    if (this.tabs?.length) {
      let tab = this.tabs[0];
      if (this.tabSelectedId) {
        tab = this.tabs.find((t) => t.id === this.tabSelectedId);
      }
      this.tabSelectedChange(tab);
    }
  }

  public getTabDisabledTooltip(tab: ResponsiveTabI): string {
    if (tab.disabled && tab.disabled() && tab.disabledTooltip) {
      return this.translateService.instant(tab.disabledTooltip);
    }
  }

  public tabSelectedChange(tab: ResponsiveTabI): void {
    if (tab.disabled && tab.disabled()) {
      return;
    }
    this.tabSelected = tab;
    this.tabSelectedId = tab.id;
    this.tabSelectedEvent.emit(this.tabSelected);
  }

  public calculateTabsWidth(): void {
    this.showMoreButton = false;
    this.visibleTabs = this.tabs;
    this.hiddenTabs = [];
    const tabsWrapperWidth = this.responsiveTabsWrapper.nativeElement.offsetWidth;
    let tabsWidth = 0;
    let lastTabWidth = 0;
    if (!this.calculatingTabsWidth) {
      this.calculatingTabsWidth = true;
      setTimeout(() => {
        const finalVisibleTabs: ResponsiveTabI[] = [];
        this.responsiveTab.forEach((tab, i) => {
          lastTabWidth = tab.nativeElement.offsetWidth;
          tabsWidth += tab.nativeElement.offsetWidth + 12;
          if (
            finalVisibleTabs.length >= 2 &&
            (this.showMoreButton || tabsWrapperWidth - lastTabWidth < tabsWidth) &&
            (i < this.tabs.length - 1 || this.hiddenTabs.length > 0)
          ) {
            this.showMoreButton = true;
            this.hiddenTabs.push(this.tabs[i]);
          } else {
            finalVisibleTabs.push(this.tabs[i]);
          }
        });
        this.calculatingTabsWidth = false;
        if ((!tabsWidth && tabsWrapperWidth) || !finalVisibleTabs.length) {
          this.calculateTabsWidth();
          return;
        }
        this.visibleTabs = finalVisibleTabs;
      }, 10);
    }
  }

  public isHiddenTabSelected(): boolean {
    return this.hiddenTabs.filter((tab) => tab.id === this.tabSelected?.id).length > 0;
  }

  public isAnyHiddenTabRequired(): boolean {
    if (this.hiddenTabs?.length) {
      return this.hiddenTabs.reduce((prev, curr) => {
        if (prev) {
          return prev;
        } else {
          return this.requiredFieldsAuxService.isTabRequired(curr.colId, curr.id);
        }
      }, false);
    }

    return false;
  }

  public getHiddenTabsTooltip(): string {
    if (this.hiddenTabs?.length) {
      const fields: string = this.hiddenTabs.reduce((prev, curr) => {
        if (prev) {
          return prev + ', ' + this.requiredFieldsAuxService.getTabRequiredFieldsString(curr.colId, curr.id);
        } else {
          return this.requiredFieldsAuxService.getTabRequiredFieldsString(curr.colId, curr.id);
        }
      }, '');
      return this.translateService.instant(marker('common.fieldRequired')) + ': ' + fields;
    }

    return '';
  }
}
