/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import WorkflowFilterDTO from '@data/models/workflows/workflow-filter-dto';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { map, startWith } from 'rxjs/operators';
import WorkflowStateDTO from '@data/models/workflows/workflow-state-dto';
import { forkJoin, Observable, of } from 'rxjs';
import WorkflowSubstateDTO from '@data/models/workflows/workflow-substate-dto';
import WorkflowSubstateUserDTO from '@data/models/workflows/workflow-substate-user-dto';
import { WorkflowFilterService } from '../../aux-service/workflow-filter.service';

@UntilDestroy()
@Component({
  selector: 'app-workflow-navbar-filter-form',
  templateUrl: './workflow-navbar-filter-form.component.html',
  styleUrls: ['./workflow-navbar-filter-form.component.scss']
})
export class WorkflowNavbarFilterFormComponent implements OnInit {
  @Input() hideSubstatesWithCardsButton: boolean;
  public filterForm: FormGroup;
  public filterOptions: WorkflowFilterDTO = null;
  public labels = {
    state: marker('common.state'),
    substate: marker('common.substate'),
    user: marker('common.user'),
    priority: marker('common.priority'),
    filterState: marker('workflows.filterState'),
    filterSubstate: marker('workflows.filterSubstate'),
    filterUser: marker('workflows.filterUser'),
    cleanFilter: marker('common.cleanFilter'),
    substatesWithCards: marker('workflows.substatesWithCards'),
    substatesWithAndWithoutCards: marker('workflows.substatesWithAndWithoutCards'),
    substatesWithoutCards: marker('workflows.substatesWithoutCards')
  };
  public statesOptions: Observable<WorkflowStateDTO[] | any[]>;
  public subStatesOptions: Observable<WorkflowSubstateDTO[] | any[]>;
  public usersOptions: Observable<WorkflowSubstateUserDTO[] | any[]>;
  private filterValue: WorkflowFilterDTO = null;

  constructor(private workflowFilterService: WorkflowFilterService, private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.filterValue = this.workflowFilterService.workflowFilterSubject$.getValue();
    this.initForms();
    this.initListeners();
  }

  public isWorkflowFilterActive = (): boolean => this.workflowFilterService.isWorkflowFilterActive();

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
    if (this.filterForm.get('substatesWithCards').value) {
      this.filterForm.get('substatesWithCards').setValue('BOTH');
      this.notifyChangesInFilter();
    }
  }

  public hasDataSelected(option: 'states' | 'subStates' | 'users' | 'priorities' | 'substatesWithCards'): boolean {
    if (option !== 'substatesWithCards' && this.filterForm?.get(option)?.value?.length > 0) {
      return true;
    } else if (option === 'substatesWithCards' && this.filterForm?.get(option).value !== 'BOTH') {
      return true;
    }
    return false;
  }

  public getUserName(wUser: WorkflowSubstateUserDTO): string {
    return `${wUser.user.name} ${wUser.user.firstName} ${wUser.user.lastName}`;
  }

  public filterSubstatesWithCards(): void {
    const actualValue = this.filterForm.get('substatesWithCards').value;
    if (actualValue === 'BOTH') {
      this.filterForm.get('substatesWithCards').setValue('WITH_CARDS');
    } else if (actualValue === 'WITH_CARDS') {
      this.filterForm.get('substatesWithCards').setValue('WITHOUT_CARDS');
    } else {
      this.filterForm.get('substatesWithCards').setValue('BOTH');
    }
    this.notifyChangesInFilter();
  }

  private initForms(): void {
    this.filterForm = this.formBuilder.group({
      states: [this.filterValue?.states ? this.filterValue.states : []],
      subStates: [this.filterValue?.subStates ? this.filterValue.subStates : []],
      users: [this.filterValue?.users ? this.filterValue.users : []],
      priorities: [this.filterValue?.priorities ? this.filterValue.priorities : []],
      substatesWithCards: [this.filterValue?.substatesWithCards ? this.filterValue?.substatesWithCards : 'BOTH'],
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
    this.workflowFilterService.workflowFilterOptionsSubject$
      .pipe(untilDestroyed(this))
      .subscribe((filterOptions: WorkflowFilterDTO) => {
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
    const filterValue: WorkflowFilterDTO = {
      states: this.filterForm.get('states').value,
      subStates: this.filterForm.get('subStates').value,
      users: this.filterForm.get('users').value,
      priorities: this.filterForm.get('priorities').value,
      substatesWithCards: this.filterForm.get('substatesWithCards').value
    };
    this.workflowFilterService.workflowFilterSubject$.next(filterValue);
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
