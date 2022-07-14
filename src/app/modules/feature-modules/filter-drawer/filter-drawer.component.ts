import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { FilterDrawerService } from './services/filter-drawer.service';

@Component({
  selector: 'app-filter-drawer',
  templateUrl: './filter-drawer.component.html',
  styleUrls: ['./filter-drawer.component.scss']
})
export class FilterDrawerComponent implements OnInit, AfterViewInit {
  @Input() filterDrawer: MatDrawer;
  @Output() disableClose: EventEmitter<boolean> = new EventEmitter();
  @ViewChild('filterDrawerInnerContainerRef', { read: ViewContainerRef, static: false })
  public filterDrawerInnerContainerRef: ViewContainerRef;
  public labels = {
    title: marker('common.filter'),
    reset: marker('common.reset'),
    apply: marker('common.apply')
  };

  constructor(public filterDrawerService: FilterDrawerService) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.filterDrawerService.setFilterDrawerComponent(this.filterDrawer, this.filterDrawerInnerContainerRef, this.disableClose);
  }
}
