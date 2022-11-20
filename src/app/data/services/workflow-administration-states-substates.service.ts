import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENV } from '@app/constants/global.constants';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
import { WorkflowFilterService } from '@modules/app-modules/workflow/aux-service/workflow-filter.service';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import WorkflowStateDTO from '@data/models/workflows/workflow-state-dto';

@Injectable({
  providedIn: 'root'
})
export class WorkflowAdministrationStatesSubstatesService {
  private readonly WORKFLOW_PATH = '/api/workflows';
  private readonly STATES_PATH = '/states';
  private readonly SUBSTATES_PATH = '/substates';
  constructor(@Inject(ENV) private env: Env, private http: HttpClient, private workflowFilterService: WorkflowFilterService) {}

  /**
   * Crear Editar Estado de Workflow
   *
   * @returns WorkflowStateDTO
   */
  public createEditWorkflowState(workflowId: number, state: WorkflowStateDTO): Observable<WorkflowStateDTO> {
    return this.http
      .post<WorkflowStateDTO>(`${this.env.apiBaseUrl}${this.WORKFLOW_PATH}/${workflowId}${this.STATES_PATH}`, state)
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
}
