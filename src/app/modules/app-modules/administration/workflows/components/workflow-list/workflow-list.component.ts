import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import WorkflowDTO from '@data/models/workflows/workflow-dto';
// eslint-disable-next-line max-len
import { AdministrationCommonHeaderSectionComponent } from '@modules/feature-modules/administration-common-header-section/administration-common-header-section.component';
import { Observable } from 'rxjs';
import { WorkflowsTableComponent } from '../workflows-table/workflows-table.component';

@Component({
  selector: 'app-workflow-list',
  templateUrl: './workflow-list.component.html',
  styleUrls: ['./workflow-list.component.scss']
})
export class WorkflowListComponent implements OnInit {
  @ViewChild('usersHeader') usersHeader: AdministrationCommonHeaderSectionComponent;
  @ViewChild('workflowsTable') workflowsTable: WorkflowsTableComponent;

  public labels = {
    createWorkflow: marker('workflows.createWorkflow')
  };
  private lastFilterSearch: string;

  constructor(private router: Router) {}

  ngOnInit(): void {}

  public buttonCreateAction(): void {
    this.router.navigate([RouteConstants.ADMINISTRATION, RouteConstants.ADM_WORKFLOWS, RouteConstants.CREATE_WORKFLOW]);
  }

  public getFilteredData = (
    text: string
  ): Observable<{ content: WorkflowDTO[]; optionLabelFn: (option: WorkflowDTO) => string } | null> =>
    this.workflowsTable.getFilteredData(text);

  public buttonShowFilterDrawerAction(): void {
    this.workflowsTable.openFilterDialog();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public buttonSearchAction(option: any): void {
    this.lastFilterSearch = option;
    return this.workflowsTable.showFilterOptionSelected(option);
  }

  public areFiltersSettedAndActive(): boolean {
    return this.workflowsTable?.areFiltersSettedAndActive();
  }
}
