import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENV } from '@app/constants/global.constants';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
import { WorkflowFilterService } from '@modules/app-modules/workflow/aux-service/workflow-filter.service';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import WorkflowStateDTO from '@data/models/workflows/workflow-state-dto';
import WorkflowSubstateDTO from '@data/models/workflows/workflow-substate-dto';
import WorkflowMoveDTO from '@data/models/workflows/workflow-move-dto';
import WorkflowSubstateEventDTO from '@data/models/workflows/workflow-substate-event-dto';

@Injectable({
  providedIn: 'root'
})
export class WorkflowAdministrationStatesSubstatesService {
  private readonly WORKFLOW_PATH = '/api/workflows';
  private readonly STATES_PATH = '/states';
  private readonly SUBSTATES_PATH = '/substates';
  private readonly ORDERS_PATH = '/orders';
  private readonly MOVEMENTS_PATH = '/movements';
  private readonly EVENTS_PATH = '/events';
  private readonly ALL_PATH = '/all';
  constructor(@Inject(ENV) private env: Env, private http: HttpClient, private workflowFilterService: WorkflowFilterService) {}

  /**
   * Devuelve el listado completo de estados y subestados.
   *
   * @returns WorkflowStateDTO[]
   */
  public getAllStatesAndSubstates(): Observable<WorkflowStateDTO[]> {
    return this.http
      .get<WorkflowStateDTO[]>(`${this.env.apiBaseUrl}${this.WORKFLOW_PATH}${this.STATES_PATH}${this.ALL_PATH}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Obtener Workflow States and Substates
   *
   * @returns WorkflowStateDTO[]
   */
  public getWorkflowStatesAndSubstates(workflowId: number): Observable<WorkflowStateDTO[]> {
    return this.http
      .get<WorkflowStateDTO[]>(`${this.env.apiBaseUrl}${this.WORKFLOW_PATH}/${workflowId}${this.STATES_PATH}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Crear Estado de Workflow
   *
   * @returns WorkflowStateDTO
   */
  public createWorkflowState(workflowId: number, state: WorkflowStateDTO): Observable<WorkflowStateDTO> {
    return this.http
      .post<WorkflowStateDTO>(`${this.env.apiBaseUrl}${this.WORKFLOW_PATH}/${workflowId}${this.STATES_PATH}`, state)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Modificar orden estados del Workflow
   *
   * @returns WorkflowStateDTO[]
   */
  public editOrderWorkflowStates(workflowId: number, states: WorkflowStateDTO[]): Observable<WorkflowStateDTO[]> {
    return this.http
      .post<WorkflowStateDTO[]>(
        `${this.env.apiBaseUrl}${this.WORKFLOW_PATH}/${workflowId}${this.STATES_PATH}${this.ORDERS_PATH}`,
        states
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Eliminar Estado de Workflow
   *
   * @returns boolean
   */
  public deleteWorkflowState(workflowId: number, stateId: number): Observable<boolean> {
    return this.http
      .delete<boolean>(`${this.env.apiBaseUrl}${this.WORKFLOW_PATH}/${workflowId}${this.STATES_PATH}/${stateId}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Crear Subestado de Workflow
   *
   * @returns WorkflowSubstateDTO
   */
  public createWorkflowSubstate(
    workflowId: number,
    stateId: number,
    substate: WorkflowSubstateDTO
  ): Observable<WorkflowSubstateDTO> {
    return this.http
      .post<WorkflowSubstateDTO>(
        `${this.env.apiBaseUrl}${this.WORKFLOW_PATH}/${workflowId}${this.STATES_PATH}/${stateId}${this.SUBSTATES_PATH}`,
        substate
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Modificar orden estados del Workflow
   *
   * @returns WorkflowStateDTO
   */
  public editOrderWorkflowSubstates(workflowId: number, state: WorkflowStateDTO): Observable<WorkflowStateDTO> {
    return this.http
      .post<WorkflowStateDTO>(
        `${this.env.apiBaseUrl}${this.WORKFLOW_PATH}/${workflowId}${this.SUBSTATES_PATH}${this.ORDERS_PATH}`,
        state
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Eliminar Subestado de Workflow
   *
   * @returns boolean
   */
  public deleteWorkflowSubstate(workflowId: number, stateId: number, substateId: number): Observable<boolean> {
    return this.http
      .delete<boolean>(
        // eslint-disable-next-line max-len
        `${this.env.apiBaseUrl}${this.WORKFLOW_PATH}/${workflowId}${this.STATES_PATH}/${stateId}${this.SUBSTATES_PATH}/${substateId}`
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Obtener movimientos asociados a un subestado
   *
   * @returns WorkflowMoveDTO[]
   */
  public getWorkflowSubstateMovements(workflowId: number, substateId: number): Observable<WorkflowMoveDTO[]> {
    return this.http
      .get<WorkflowMoveDTO[]>(
        // eslint-disable-next-line max-len
        `${this.env.apiBaseUrl}${this.WORKFLOW_PATH}/${workflowId}${this.STATES_PATH}${this.SUBSTATES_PATH}/${substateId}${this.MOVEMENTS_PATH}`
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  public postWorkflowSubstateMovements(
    workflowId: number,
    substateId: number,
    wfMovement: WorkflowMoveDTO
  ): Observable<WorkflowMoveDTO> {
    return this.http
      .post<WorkflowMoveDTO>(
        // eslint-disable-next-line max-len
        `${this.env.apiBaseUrl}${this.WORKFLOW_PATH}/${workflowId}${this.STATES_PATH}${this.SUBSTATES_PATH}/${substateId}${this.MOVEMENTS_PATH}`,
        wfMovement
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Eliminar Movimiento asociado a subestado de Workflow
   *
   * @returns boolean
   */
  public deleteWorkflowSubstateMovement(workflowId: number, substateId: number, movementId: number): Observable<boolean> {
    return this.http
      .delete<boolean>(
        // eslint-disable-next-line max-len
        `${this.env.apiBaseUrl}${this.WORKFLOW_PATH}/${workflowId}${this.STATES_PATH}${this.SUBSTATES_PATH}/${substateId}${this.MOVEMENTS_PATH}/${movementId}`
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Obtener eventos asociados a un subestado
   *
   * @returns WorkflowMoveDTO[]
   */
  public getWorkflowSubstateEvents(workflowId: number, substateId: number): Observable<WorkflowSubstateEventDTO[]> {
    return this.http
      .get<WorkflowSubstateEventDTO[]>(
        // eslint-disable-next-line max-len
        `${this.env.apiBaseUrl}${this.WORKFLOW_PATH}/${workflowId}${this.STATES_PATH}${this.SUBSTATES_PATH}/${substateId}${this.EVENTS_PATH}`
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  public postWorkflowSubstateEvents(
    workflowId: number,
    substateId: number,
    wfEvents: WorkflowSubstateEventDTO[]
  ): Observable<WorkflowSubstateEventDTO[]> {
    return this.http
      .post<WorkflowSubstateEventDTO[]>(
        // eslint-disable-next-line max-len
        `${this.env.apiBaseUrl}${this.WORKFLOW_PATH}/${workflowId}${this.STATES_PATH}${this.SUBSTATES_PATH}/${substateId}${this.EVENTS_PATH}`,
        wfEvents
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
}
