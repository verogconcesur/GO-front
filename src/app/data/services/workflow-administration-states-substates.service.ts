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

@Injectable({
  providedIn: 'root'
})
export class WorkflowAdministrationStatesSubstatesService {
  private readonly WORKFLOW_PATH = '/api/workflows';
  private readonly STATES_PATH = '/states';
  private readonly SUBSTATES_PATH = '/substates';
  private readonly ORDERS_PATH = '/orders';
  constructor(@Inject(ENV) private env: Env, private http: HttpClient, private workflowFilterService: WorkflowFilterService) {}

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
}
