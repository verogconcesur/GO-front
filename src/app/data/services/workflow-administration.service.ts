import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENV } from '@app/constants/global.constants';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
import WorkflowDTO from '@data/models/workflows/workflow-dto';
import { WorkflowFilterService } from '@modules/app-modules/workflow/aux-service/workflow-filter.service';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WorkflowAdministrationService {
  private readonly WORKFLOW_PATH = '/api/workflows';
  constructor(@Inject(ENV) private env: Env, private http: HttpClient, private workflowFilterService: WorkflowFilterService) {}

  /**
   * Crear Editar Workflow
   *
   * @returns WorkflowDTO[]
   */
  public createEditWorkflow(workflow: WorkflowDTO, status?: string): Observable<WorkflowDTO> {
    if (status) {
      workflow.status = status;
    } else {
      workflow.status = 'DRAFT';
    }
    return this.http
      .post<WorkflowDTO>(`${this.env.apiBaseUrl}${this.WORKFLOW_PATH}`, workflow)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
  /**
   * Obtener Workflow
   *
   * @returns WorkflowDTO[]
   */
  public getWorkflow(workflowId: number): Observable<WorkflowDTO> {
    return this.http
      .get<WorkflowDTO>(`${this.env.apiBaseUrl}${this.WORKFLOW_PATH}/${workflowId}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
}
