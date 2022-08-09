/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { WorkflowsService } from '@data/services/workflows.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import WorkflowFilterDto from '@data/models/workflows/workflow-filter-dto';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { map, startWith } from 'rxjs/operators';
import WorkflowStateDto from '@data/models/workflows/workflow-state-dto';
import { forkJoin, Observable, of } from 'rxjs';
import WorkflowSubstateDto from '@data/models/workflows/workflow-substate-dto';
import WorkflowSubstateUserDto from '@data/models/workflows/workflow-substate-user-dto';

@UntilDestroy()
@Component({
  selector: 'app-workflow-navbar-filter-form',
  templateUrl: './workflow-navbar-filter-form.component.html',
  styleUrls: ['./workflow-navbar-filter-form.component.scss']
})
export class WorkflowNavbarFilterFormComponent implements OnInit {
  public filterForm: FormGroup;
  public filterOptions: WorkflowFilterDto = null;
  public labels = {
    state: marker('common.state'),
    substate: marker('common.substate'),
    user: marker('common.user'),
    priority: marker('common.priority'),
    filterState: marker('workflows.filterState'),
    filterSubstate: marker('workflows.filterSubstate'),
    filterUser: marker('workflows.filterUser'),
    cleanFilter: marker('common.cleanFilter')
  };
  public statesOptions: Observable<WorkflowStateDto[] | any[]>;
  public subStatesOptions: Observable<WorkflowSubstateDto[] | any[]>;
  public usersOptions: Observable<WorkflowSubstateUserDto[] | any[]>;
  private filterValue: WorkflowFilterDto = null;
  constructor(private workflowService: WorkflowsService, private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.filterValue = this.workflowService.workflowFilterSubject$.getValue();
    this.initForms();
    this.initListeners();
  }

  public isWorkflowFilterActive = (): boolean => this.workflowService.isWorkflowFilterActive();

  public clearFilterData(): void {
    if (this.filterForm.get('states').value.length) {
      this.filterForm.get('states').setValue([]);
    }
    if (this.filterForm.get('subStates').value.length) {
      this.filterForm.get('subStates').setValue([]);
    }
    if (this.filterForm.get('users').value.length) {
      this.filterForm.get('users').setValue([]);
    }
    if (this.filterForm.get('priorities').value.length) {
      this.filterForm.get('priorities').setValue([]);
    }
  }

  public hasDataSelected(option: 'states' | 'subStates' | 'users' | 'priorities'): boolean {
    if (this.filterForm?.get(option)?.value?.length > 0) {
      return true;
    }
    return false;
  }

  public getUserName(wUser: WorkflowSubstateUserDto): string {
    return `${wUser.user.name} ${wUser.user.firstName} ${wUser.user.lastName}`;
  }

  private initForms(): void {
    this.filterForm = this.formBuilder.group({
      states: [this.filterValue?.states ? this.filterValue.states : []],
      subStates: [this.filterValue?.subStates ? this.filterValue.subStates : []],
      users: [this.filterValue?.users ? this.filterValue.users : []],
      priorities: [this.filterValue?.priorities ? this.filterValue.priorities : []],
      statesSearch: [''],
      subStatesSearch: [''],
      usersSearch: ['']
    });
  }

  private initListeners(): void {
    this.filterForm
      .get('states')
      ?.valueChanges.pipe(untilDestroyed(this))
      .subscribe((data) => {
        this.notifyChangesInFilter();
      });
    this.filterForm
      .get('subStates')
      ?.valueChanges.pipe(untilDestroyed(this))
      .subscribe((data) => {
        this.notifyChangesInFilter();
      });
    this.filterForm
      .get('users')
      ?.valueChanges.pipe(untilDestroyed(this))
      .subscribe((data) => {
        this.notifyChangesInFilter();
      });
    this.workflowService.workflowFilterOptionsSubject$
      .pipe(untilDestroyed(this))
      .subscribe((filterOptions: WorkflowFilterDto) => {
        this.filterOptions = filterOptions;

        this.statesOptions = this.filterForm.get('statesSearch')?.valueChanges.pipe(
          untilDestroyed(this),
          startWith(''),
          map((value) => this.filter('states', 'name', value || ''))
        );

        this.subStatesOptions = this.subStatesOptions = this.filterForm.get('subStatesSearch')?.valueChanges.pipe(
          untilDestroyed(this),
          startWith(''),
          map((value) => this.filter('subStates', 'name', value || ''))
        );

        this.usersOptions = this.filterForm.get('usersSearch')?.valueChanges.pipe(
          untilDestroyed(this),
          startWith(''),
          map((value) => this.filter('users', 'workflowUserName', value || ''))
        );
      });
  }

  private notifyChangesInFilter(): void {
    const filterValue: WorkflowFilterDto = {
      states: this.filterForm.get('states').value,
      subStates: this.filterForm.get('subStates').value,
      users: this.filterForm.get('users').value,
      priorities: this.filterForm.get('priorities').value
    };
    this.workflowService.workflowFilterSubject$.next(filterValue);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private filter = (from: 'states' | 'subStates' | 'users', attr: string, value: string): any[] => {
    const filterValue = `${value}`.toLowerCase();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return [...this.filterOptions[from]].filter((item: any) =>
      `${attr === 'workflowUserName' ? this.getUserName(item) : item[attr]}`.toLowerCase().includes(filterValue)
    );
  };
}
