import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENV } from '@app/constants/global.constants';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
import CardDTO from '@data/models/cards/card-dto';
import RoleDTO from '@data/models/user-permissions/role-dto';
import WorkflowCardTabDTO from '@data/models/workflow-admin/workflow-card-tab-dto';
import CardColumnDTO from '@data/models/cards/card-column-dto';
import WorkflowOrganizationDTO from '@data/models/workflow-admin/workflow-organization-dto';
import WorkflowRoleDTO from '@data/models/workflow-admin/workflow-role-dto';
import WorkflowViewDTO from '@data/models/workflow-admin/workflow-view-dto';
import WorkflowDTO from '@data/models/workflows/workflow-dto';
import WorkflowSubstateUserDTO from '@data/models/workflows/workflow-substate-user-dto';
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
  private readonly CARD_PATH = '/card';
  private readonly PERMISSIONS_PATH = '/permissions';
  private readonly USERS_PATH = '/users';
  private readonly VIEW_PATH = '/views';
  private readonly ATTRIBUTES_PATH = '/attributes';
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
   * @returns WorkflowOrganizationDTO[]
   */
  public getWorkflowOrganization(workflowId: number): Observable<WorkflowOrganizationDTO> {
    return this.http
      .get<WorkflowDTO>(`${this.env.apiBaseUrl}${this.WORKFLOW_PATH}/${workflowId}${this.ORGANIZATION_PATH}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Editar Organización Workflow Workflow
   *
   * @returns WorkflowOrganizationDTO[]
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
   * @returns WorkflowRoleDTO[]
   */
  public getWorkflowRoles(workflowId: number): Observable<WorkflowRoleDTO[]> {
    return this.http
      .get<WorkflowRoleDTO[]>(`${this.env.apiBaseUrl}${this.WORKFLOW_PATH}/${workflowId}${this.ROLES_PATH}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Editar Roles Workflow
   *
   * @returns WorkflowRoleDTO[]
   */
  public postWorkflowRoles(workflowId: number, workflowRoles: WorkflowRoleDTO[]): Observable<{ roles: WorkflowRoleDTO[] }> {
    return this.http
      .post<{ roles: WorkflowRoleDTO[] }>(
        `${this.env.apiBaseUrl}${this.WORKFLOW_PATH}/${workflowId}${this.ROLES_PATH}`,
        workflowRoles
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Obtener Users Workflow
   *
   * @returns WorkflowSubstateUserDTO[]
   */
  public getWorkflowUsers(workflowId: number): Observable<WorkflowSubstateUserDTO[]> {
    return this.http
      .get<WorkflowSubstateUserDTO[]>(`${this.env.apiBaseUrl}${this.WORKFLOW_PATH}/${workflowId}${this.USERS_PATH}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Editar Users Workflow
   *
   * @returns WorkflowSubstateUserDTO[]
   */
  public postWorkflowUsers(workflowId: number, workflowUsers: WorkflowSubstateUserDTO[]): Observable<WorkflowSubstateUserDTO[]> {
    return this.http
      .post<WorkflowSubstateUserDTO[]>(
        `${this.env.apiBaseUrl}${this.WORKFLOW_PATH}/${workflowId}${this.USERS_PATH}`,
        workflowUsers
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Obtener Card Workflow
   *
   * @returns CardDTO[]
   */
  public getWorkflowCard(workflowId: number): Observable<CardDTO[]> {
    return this.http
      .get<CardDTO[]>(`${this.env.apiBaseUrl}${this.WORKFLOW_PATH}/${workflowId}${this.CARD_PATH}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
  /**
   * Obtener Views Workflow
   *
   * @returns WorkflowViewDTO[]
   */
  public getWorkflowViews(workflowId: number): Observable<WorkflowViewDTO[]> {
    return this.http
      .get<WorkflowViewDTO[]>(`${this.env.apiBaseUrl}${this.WORKFLOW_PATH}/${workflowId}${this.VIEW_PATH}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Editar Card Workflow
   *
   * @returns CardDTO[]
   */
  public postWorkflowCard(workflowId: number, card: CardDTO): Observable<CardDTO[]> {
    return this.http
      .post<CardDTO[]>(`${this.env.apiBaseUrl}${this.WORKFLOW_PATH}/${workflowId}${this.CARD_PATH}`, card)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
  /**
   * Obtener Views Attributes Workflow
   *
   * @returns CardColumnDTO[]
   */
  public getWorkflowViewAttributes(workflowId: number): Observable<CardColumnDTO[]> {
    return this.http
      .get<CardColumnDTO[]>(`${this.env.apiBaseUrl}${this.WORKFLOW_PATH}/${workflowId}${this.VIEW_PATH}${this.ATTRIBUTES_PATH}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Obtener Card Workflow Permissions
   *
   * @returns CardDTO[]
   */
  public getWorkflowUserRoles(workflowId: number): Observable<RoleDTO[]> {
    return this.http
      .get<RoleDTO[]>(`${this.env.apiBaseUrl}${this.WORKFLOW_PATH}/${workflowId}${this.USERS_PATH}${this.ROLES_PATH}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Obtener Card Workflow Permissions
   *
   * @returns CardDTO[]
   */
  public getWorkflowCardPermissions(workflowId: number): Observable<WorkflowCardTabDTO[]> {
    return this.http
      .get<CardDTO[]>(`${this.env.apiBaseUrl}${this.WORKFLOW_PATH}/${workflowId}${this.CARD_PATH}${this.PERMISSIONS_PATH}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Editar Card Workflow
   *
   * @returns CardDTO[]
   */
  public postWorkflowCardPermissions(workflowId: number, cardTabList: WorkflowCardTabDTO[]): Observable<WorkflowCardTabDTO[]> {
    return this.http
      .post<WorkflowCardTabDTO[]>(
        `${this.env.apiBaseUrl}${this.WORKFLOW_PATH}/${workflowId}${this.CARD_PATH}${this.PERMISSIONS_PATH}`,
        cardTabList
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
  /**
   * Editar Users Workflow
   *
   * @returns WorkflowViewDTO[]
   */
  public postWorkflowViews(workflowId: number, workflowViews: WorkflowViewDTO[]): Observable<WorkflowViewDTO[]> {
    return this.http
      .post<WorkflowViewDTO[]>(`${this.env.apiBaseUrl}${this.WORKFLOW_PATH}/${workflowId}${this.VIEW_PATH}`, workflowViews)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
}
