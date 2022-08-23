import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';

export interface ResponsiveTabI {
  id: string;
  labelToTranslate: string;
}

@Component({
  selector: 'app-responsive-tabs',
  templateUrl: './responsive-tabs.component.html',
  styleUrls: ['./responsive-tabs.component.scss']
})
export class ResponsiveTabsComponent implements OnInit, AfterViewInit {
  @ViewChild('responsiveTabsWrapper') responsiveTabsWrapper: ElementRef;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @ViewChildren('responsiveTab', { read: ElementRef }) responsiveTab: QueryList<ElementRef>;
  @Input() tabs: ResponsiveTabI[];
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

  constructor() {}

  @HostListener('window:resize', ['$event']) onResize(event: { target: { innerWidth: number } }) {
    this.calculateTabsWidth();
  }

  ngOnInit(): void {
    if (this.tabs?.length) {
      this.tabSelectedChange(this.tabs[0]);
    }
  }

  ngAfterViewInit(): void {
    this.calculateTabsWidth();
  }

  public tabSelectedChange(tab: ResponsiveTabI): void {
    this.tabSelected = tab;
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
    return this.hiddenTabs.filter((tab) => tab.id === this.tabSelected.id).length > 0;
  }
}
