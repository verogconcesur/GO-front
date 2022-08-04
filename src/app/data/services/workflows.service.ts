/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENV } from '@app/constants/global.constants';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
import WorkflowDto from '@data/models/workflows/workflow-dto';
import WorkflowFilterDto from '@data/models/workflows/workflow-filter-dto';
import WorkflowListByFacilityDto from '@data/models/workflows/workflow-list-by-facility-dto';
import WorkflowStateDto from '@data/models/workflows/workflow-state-dto';
import WorkflowSubstateDto from '@data/models/workflows/workflow-substate-dto';
import WorkflowSubstateUserDto from '@data/models/workflows/workflow-substate-user-dto';
import { BehaviorSubject, Observable, of, Subject, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WorkflowsService {
  //Stores the selected workflow.
  public workflowSelectedSubject$: BehaviorSubject<WorkflowDto> = new BehaviorSubject(null);
  //Stores the filter selection.
  public workflowFilterSubject$: BehaviorSubject<WorkflowFilterDto> = new BehaviorSubject({
    states: [],
    subStates: [],
    users: [],
    priorities: []
  });
  //Stores the filter options to show
  public workflowFilterOptionsSubject$: BehaviorSubject<WorkflowFilterDto> = new BehaviorSubject({
    states: [],
    subStates: [],
    users: [],
    priorities: []
  });

  private readonly GET_WORKFLOWS_PATH = '/api/workflows';
  private readonly GET_WORKFLOWS_LIST_PATH = '/list';
  private readonly GET_WORKFLOWS_INSTANCE_PATH = '/instances';

  constructor(@Inject(ENV) private env: Env, private http: HttpClient) {}

  /**
   * Devuelve el listado de workflow que el usuario logado puede ver.
   *
   * @returns WorkflowListByFacilityDto[]
   */
  public getWorkflowsList(): Observable<WorkflowListByFacilityDto[]> {
    return this.http
      .get<WorkflowListByFacilityDto[]>(`${this.env.apiBaseUrl}${this.GET_WORKFLOWS_PATH}${this.GET_WORKFLOWS_LIST_PATH}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Get all elements of a workflow
   *
   * @param workflow WorkflowDto
   * @returns
   */
  public getWorkflowInstances(workflow: WorkflowDto, extractFilterInfo?: boolean): Observable<WorkflowStateDto[]> {
    return this.http
      .get<WorkflowStateDto[]>(
        `${this.env.apiBaseUrl}${this.GET_WORKFLOWS_PATH}/${workflow.id}${this.GET_WORKFLOWS_INSTANCE_PATH}`
      )
      .pipe(
        map((data: WorkflowStateDto[]) => {
          if (extractFilterInfo) {
            this.getFilterInfo(data);
          }
          return data;
        }),
        catchError((error) => throwError(error.error as ConcenetError))
      );
  }

  //Aux functions
  public resetWorkflowFilter(): void {
    const filter: WorkflowFilterDto = {
      states: [],
      subStates: [],
      users: [],
      priorities: []
    };
    this.workflowFilterSubject$.next(filter);
    this.workflowFilterOptionsSubject$.next(filter);
  }

  public isWorkflowFilterActive(): boolean {
    const filterValue = this.workflowFilterSubject$.getValue();
    if (
      filterValue &&
      (filterValue.states.length || filterValue.subStates.length || filterValue.users.length || filterValue.priorities.length)
    ) {
      return true;
    }
    return false;
  }

  private getFilterInfo(data: WorkflowStateDto[]): void {
    const subStates: WorkflowSubstateDto[] = [];
    const users: WorkflowSubstateUserDto[] = [];
    const priorities: string[] = [];
    data.forEach((states: WorkflowStateDto) => {
      states.workflowSubstates.forEach((subState: WorkflowSubstateDto) => {
        //Substate
        const similarSubState = subStates.find((ss: WorkflowSubstateDto) => ss.name === subState.name);
        if (similarSubState) {
          similarSubState.idsToFilter.push(subState.id);
        } else {
          subStates.push({ ...subState, idsToFilter: [...(subState.idsToFilter ? subState.idsToFilter : []), subState.id] });
        }
        //User
        subState.workflowSubstateUser.forEach((subStateUser: WorkflowSubstateUserDto) => {
          if (!users.find((user: WorkflowSubstateUserDto) => user.id === subStateUser.id)) {
            users.push(subStateUser);
          }
        });

        //TODO PRIORITIES
      });
    });
    const filterOptions: WorkflowFilterDto = {
      states: [...data],
      subStates: [...subStates],
      users: [...users],
      priorities: [...priorities]
    };
    this.workflowFilterOptionsSubject$.next(filterOptions);
  }
}
