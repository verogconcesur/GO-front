/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENV } from '@app/constants/global.constants';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
import WorkflowCardDTO from '@data/models/workflows/workflow-card-dto';
import WorkflowCardInstanceDTO from '@data/models/workflows/workflow-card-instance-dto';
import WorkflowDTO from '@data/models/workflows/workflow-dto';
import WorkflowMoveDTO from '@data/models/workflows/workflow-move-dto';
import WorkflowStateDTO from '@data/models/workflows/workflow-state-dto';
import WorkflowSubstateUserDTO from '@data/models/workflows/workflow-substate-user-dto';
import { WorkflowFilterService } from '@modules/app-modules/workflow/aux-service/workflow-filter.service';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WorkflowsService {
  //Stores the selected workflow.
  public workflowSelectedSubject$: BehaviorSubject<WorkflowDTO> = new BehaviorSubject(null);

  private readonly GET_WORKFLOWS_PATH = '/api/workflows';
  private readonly GET_WORKFLOWS_LIST_PATH = '/list';
  private readonly GET_WORKFLOWS_FACILITY_PATH = '/facility';
  private readonly GET_WORKFLOWS_INSTANCE_PATH = '/instances';
  private readonly GET_WORKFLOWS_VIEW_PATH = '/view';
  private readonly GET_WORKFLOWS_CARDS_PATH = '/cards';
  private readonly GET_WORKFLOWS_MOVEMENT_PATH = '/movement';
  private readonly GET_WORKFLOWS_ORDER_PATH = '/orders';

  constructor(@Inject(ENV) private env: Env, private http: HttpClient, private workflowFilterService: WorkflowFilterService) {}

  /**
   * Devuelve el listado de workflow que el usuario logado puede ver.
   *
   * @returns WorkflowDTO[]
   */
  public getWorkflowsList(): Observable<WorkflowDTO[]> {
    return this.http
      .get<WorkflowDTO[]>(`${this.env.apiBaseUrl}${this.GET_WORKFLOWS_PATH}${this.GET_WORKFLOWS_LIST_PATH}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Get all states and substates of a workflow
   *
   * @param workflow WorkflowDTO
   * @returns
   */
  public getWorkflowInstances(workflow: WorkflowDTO, extractFilterInfo?: boolean): Observable<WorkflowStateDTO[]> {
    return this.http
      .get<WorkflowStateDTO[]>(
        `${this.env.apiBaseUrl}${this.GET_WORKFLOWS_PATH}/${workflow.id}${this.GET_WORKFLOWS_INSTANCE_PATH}`
      )
      .pipe(
        map((data: WorkflowStateDTO[]) => {
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
   * @param workflow WorkflowDTO
   * @returns
   */
  public getWorkflowCards(workflow: WorkflowDTO, viewType: 'BOARD' | 'CALENDAR' | 'TABLE'): Observable<WorkflowCardDTO[]> {
    return this.http
      .get<WorkflowCardDTO[]>(
        `${this.env.apiBaseUrl}${this.GET_WORKFLOWS_PATH}/${workflow.id}${this.GET_WORKFLOWS_VIEW_PATH}/` +
          `${viewType}${this.GET_WORKFLOWS_CARDS_PATH}`
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Reorder card inside a substate
   *
   * @param facilityId
   * @param cardInstance
   * @return
   */
  public changeOrderWorkflowCardInSubstate(
    facilityId: number,
    card: WorkflowCardDTO,
    wUser: WorkflowSubstateUserDTO,
    newOrderNumber: number
  ): Observable<WorkflowCardInstanceDTO> {
    let url =
      `${this.env.apiBaseUrl}${this.GET_WORKFLOWS_PATH}/${card.cardInstanceWorkflows[0].workflowId}` +
      `${this.GET_WORKFLOWS_FACILITY_PATH}/${facilityId}${this.GET_WORKFLOWS_CARDS_PATH}${this.GET_WORKFLOWS_ORDER_PATH}`;
    if (wUser?.user) {
      url += `/${wUser.user.id}`;
    }
    return this.http
      .post<WorkflowCardInstanceDTO>(url, {
        id: card.cardInstanceWorkflows[0].cardInstance.id,
        orderNumber: newOrderNumber
      })
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
    card: WorkflowCardDTO,
    move: WorkflowMoveDTO,
    wUser: WorkflowSubstateUserDTO,
    newOrderNumber: number
  ): Observable<WorkflowCardInstanceDTO> {
    return this.http
      .post<WorkflowCardInstanceDTO>(
        `${this.env.apiBaseUrl}${this.GET_WORKFLOWS_PATH}/${card.cardInstanceWorkflows[0].workflowId}` +
          `${this.GET_WORKFLOWS_MOVEMENT_PATH}/${move.id}`,
        {
          userId: wUser?.user ? wUser?.user?.id : null,
          cardInstanceWorkflow: {
            facilityId,
            workflowId: card.cardInstanceWorkflows[0].workflowId,
            // workflowSubstateId: move.workflowSubstateTarget.id
            cardInstance: {
              id: card.cardInstanceWorkflows[0].cardInstance.id,
              orderNumber: newOrderNumber
            }
          }
        }
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
}
