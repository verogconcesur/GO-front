import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
// eslint-disable-next-line max-len
import { AdministrationCommonHeaderSectionClassToExtend } from '@modules/feature-modules/administration-common-header-section/administration-common-header-section-class-to-extend';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-client-timeline',
  templateUrl: './client-timeline.component.html',
  styleUrls: ['./client-timeline.component.scss']
})
export class ClientTimelineComponent extends AdministrationCommonHeaderSectionClassToExtend implements OnInit {
  constructor() {
    super();
  }

  ngOnInit(): void {}

  public headerCreateAction(): void {
    throw new Error('Method not implemented.');
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public headerGetFilteredData(text: string): Observable<{ content: any[]; optionLabelFn: (option: any) => string }> {
    throw new Error('Method not implemented.');
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public headerSearchAction(option: any): void {
    throw new Error('Method not implemented.');
  }
  public getData(pageEvent?: PageEvent): void {}
}
