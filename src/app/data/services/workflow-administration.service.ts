import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENV } from '@app/constants/global.constants';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
import WorkflowOrganizationDTO from '@data/models/workflow-admin/workflow-organization-dto';
import WorkflowRoleDTO from '@data/models/workflow-admin/workflow-role-dto';
import WorkflowDTO from '@data/models/workflows/workflow-dto';
import { WorkflowFilterService } from '@modules/app-modules/workflow/aux-service/workflow-filter.service';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WorkflowAdministrationService {
  private readonly WORKFLOW_PATH = '/api/workflows';
  private readonly ORGANIZATION_PATH = '/organization';
  private readonly ROLES_PATH = '/roles';
  constructor(@Inject(ENV) private env: Env, private http: HttpClient, private workflowFilterService: WorkflowFilterService) {}

  /**
   * Crear Editar Workflow
   *
   * @returns WorkflowDTO[]
   */
  public createEditWorkflow(workflow: WorkflowDTO, status?: string): Observable<WorkflowDTO> {
    if (status) {
      workflow.status = status;
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

  /**
   * Obtener Organización Workflow
   *
   * @returns WorkflowDTO[]
   */
  public getWorkflowOrganization(workflowId: number): Observable<WorkflowOrganizationDTO> {
    return this.http
      .get<WorkflowDTO>(`${this.env.apiBaseUrl}${this.WORKFLOW_PATH}/${workflowId}${this.ORGANIZATION_PATH}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Editar Organización Workflow Workflow
   *
   * @returns WorkflowDTO[]
   */
  public postWorkflowOrganization(
    workflowId: number,
    workflowOrganizationDTO: WorkflowOrganizationDTO
  ): Observable<WorkflowOrganizationDTO> {
    return this.http
      .post<WorkflowOrganizationDTO>(
        `${this.env.apiBaseUrl}${this.WORKFLOW_PATH}/${workflowId}${this.ORGANIZATION_PATH}`,
        workflowOrganizationDTO
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Obtener Roles Workflow
   *
   * @returns WorkflowDTO[]
   */
  public getWorkflowRoles(workflowId: number): Observable<WorkflowRoleDTO[]> {
    return this.http
      .get<WorkflowRoleDTO[]>(`${this.env.apiBaseUrl}${this.WORKFLOW_PATH}/${workflowId}${this.ROLES_PATH}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Editar Roles Workflow
   *
   * @returns WorkflowDTO[]
   */
  public postWorkflowRoles(workflowId: number, workflowRoles: WorkflowRoleDTO[]): Observable<WorkflowRoleDTO[]> {
    return this.http
      .post<WorkflowRoleDTO[]>(`${this.env.apiBaseUrl}${this.WORKFLOW_PATH}/${workflowId}${this.ROLES_PATH}`, workflowRoles)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
}
