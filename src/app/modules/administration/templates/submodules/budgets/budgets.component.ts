import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
// eslint-disable-next-line max-len
import { AdministrationCommonHeaderSectionClassToExtend } from '@shared/components/administration-common-header-section/administration-common-header-section-class-to-extend';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-budgets',
  templateUrl: './budgets.component.html',
  styleUrls: ['./budgets.component.scss']
})
export class BudgetsComponent extends AdministrationCommonHeaderSectionClassToExtend implements OnInit {
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
