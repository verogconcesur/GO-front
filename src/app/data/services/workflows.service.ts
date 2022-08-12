/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENV } from '@app/constants/global.constants';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
import WorkflowCardDto from '@data/models/workflows/workflow-card-dto';
import WorkflowCardInstanceDto from '@data/models/workflows/workflow-card-instance-dto';
import WorkflowDto from '@data/models/workflows/workflow-dto';
import WorkflowListByFacilityDto from '@data/models/workflows/workflow-list-by-facility-dto';
import WorkflowMoveDto from '@data/models/workflows/workflow-move-dto';
import WorkflowStateDto from '@data/models/workflows/workflow-state-dto';
import WorkflowSubstateUserDto from '@data/models/workflows/workflow-substate-user-dto';
import { WorkflowFilterService } from '@modules/app-modules/workflow/aux-service/workflow-filter.service';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WorkflowsService {
  //Stores the selected workflow.
  public workflowSelectedSubject$: BehaviorSubject<WorkflowDto> = new BehaviorSubject(null);

  private readonly GET_WORKFLOWS_PATH = '/api/workflows';
  private readonly GET_WORKFLOWS_LIST_PATH = '/list';
  private readonly GET_WORKFLOWS_FACILITY_PATH = '/facility';
  private readonly GET_WORKFLOWS_INSTANCE_PATH = '/instances';
  private readonly GET_WORKFLOWS_VIEW_PATH = '/view';
  private readonly GET_WORKFLOWS_CARDS_PATH = '/cards';
  private readonly GET_WORKFLOWS_MOVEMENT_PATH = '/movement';

  constructor(@Inject(ENV) private env: Env, private http: HttpClient, private workflowFilterService: WorkflowFilterService) {}

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
   * Get all states and substates of a workflow
   *
   * @param workflow WorkflowDto
   * @returns
   */
  public getWorkflowInstances(workflow: WorkflowDto, extractFilterInfo?: boolean): Observable<WorkflowStateDto[]> {
    return this.http
      .get<WorkflowStateDto[]>(
        `${this.env.apiBaseUrl}${this.GET_WORKFLOWS_PATH}/${workflow.id}${this.GET_WORKFLOWS_FACILITY_PATH}/` +
          `${workflow.facility.facilityId}${this.GET_WORKFLOWS_INSTANCE_PATH}`
      )
      .pipe(
        map((data: WorkflowStateDto[]) => {
          if (extractFilterInfo) {
            this.workflowFilterService.getFilterInfo(data);
          }
          return data;
        }),
        catchError((error) => throwError(error.error as ConcenetError))
      );
  }

  /**
   * Get all cards of a workflow
   *
   * @param workflow WorkflowDto
   * @returns
   */
  public getWorkflowCards(workflow: WorkflowDto, viewType: 'BOARD' | 'CALENDAR' | 'TABLE'): Observable<WorkflowCardDto[]> {
    return this.http
      .get<WorkflowCardDto[]>(
        `${this.env.apiBaseUrl}${this.GET_WORKFLOWS_PATH}/${workflow.id}${this.GET_WORKFLOWS_FACILITY_PATH}/` +
          `${workflow.facility.facilityId}${this.GET_WORKFLOWS_VIEW_PATH}/` +
          `${viewType}${this.GET_WORKFLOWS_CARDS_PATH}`
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Move card to another subState
   *
   * @param facilityId
   * @param cardInstance
   * @param move
   * @param wUser
   * @returns
   */
  public moveWorkflowCardToSubstate(
    facilityId: number,
    card: WorkflowCardDto,
    move: WorkflowMoveDto,
    wUser: WorkflowSubstateUserDto
  ): Observable<WorkflowCardInstanceDto> {
    return this.http
      .post<WorkflowCardInstanceDto>(
        `${this.env.apiBaseUrl}${this.GET_WORKFLOWS_PATH}/${card.cardInstanceWorkflows[0].workflowId}` +
          `${this.GET_WORKFLOWS_MOVEMENT_PATH}/${move.id}`,
        {
          userId: wUser?.user ? wUser?.user?.id : null,
          cardInstanceWorkflow: {
            facilityId,
            workflowId: card.cardInstanceWorkflows[0].workflowId,
            cardInstanceId: card.cardInstanceWorkflows[0].cardInstanceId
            // workflowSubstateId: move.workflowSubstateTarget.id
          }
        }
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
}
