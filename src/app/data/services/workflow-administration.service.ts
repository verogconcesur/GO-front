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
import WorkflowDTO, { WorkFlowStatusEnum } from '@data/models/workflows/workflow-dto';
import WorkflowSubstateUserDTO from '@data/models/workflows/workflow-substate-user-dto';
import { WorkflowFilterService } from '@modules/app-modules/workflow/aux-service/workflow-filter.service';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import TemplatesCommonDTO from '@data/models/templates/templates-common-dto';
import { WorkflowTimelineDTO } from '@data/models/workflow-admin/workflow-timeline-dto';
import { WorkflowAttachmentTimelineDTO } from '@data/models/workflow-admin/workflow-attachment-timeline-dto';
import WorkflowCardsLimitDTO from '@data/models/workflow-admin/workflow-card-limit-dto';
import { TemplateAtachmentItemsDTO } from '@data/models/templates/templates-attachment-dto';

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
  private readonly TIMELINE_PATH = '/timeline';
  private readonly CARDS_LIMIT_PATH = '/cardsLimits';
  private readonly ATTACHMENTS_PATH = '/attachments';
  private readonly TEMPLATES_PATH = '/listTemplates';
  private readonly BUDGET_PATH = '/budget';
  private readonly VALIDATE_PATH = '/validatePublish';
  private readonly CHANGE_STATUS_PATH = '/changeStatus';
  private readonly DATETIME_PATH = '/datetimes';
  private readonly TEMPLATE_ATTACHMENTS_PATH = '/templateAttachmentItems';

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
  public postWorkflowRoles(workflowId: number, workflowRoles: WorkflowRoleDTO[]): Observable<WorkflowRoleDTO[]> {
    return this.http
      .post<WorkflowRoleDTO[]>(`${this.env.apiBaseUrl}${this.WORKFLOW_PATH}/${workflowId}${this.ROLES_PATH}`, workflowRoles)
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
  public getWorkflowCard(workflowId: number): Observable<CardDTO> {
    return this.http
      .get<CardDTO>(`${this.env.apiBaseUrl}${this.WORKFLOW_PATH}/${workflowId}${this.CARD_PATH}`)
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
   * Obtener Views Attributes Datetimes Workflow
   *
   * @returns CardColumnDTO[]
   */
  public getWorkflowDatetimes(workflowId: number): Observable<CardColumnDTO[]> {
    return this.http
      .get<CardColumnDTO[]>(
        `${this.env.apiBaseUrl}${this.WORKFLOW_PATH}/${workflowId}${this.VIEW_PATH}${this.ATTRIBUTES_PATH}${this.DATETIME_PATH}`
      )
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

  public getTemplates(workflowId: number, templateType: string): Observable<TemplatesCommonDTO[]> {
    return this.http
      .get<TemplatesCommonDTO[]>(
        `${this.env.apiBaseUrl}${this.WORKFLOW_PATH}/${workflowId}${this.TEMPLATES_PATH}/${templateType}`
      )
      .pipe(catchError((error) => throwError(error as ConcenetError)));
  }

  /**
   * Obtener Timeline Workflow
   *
   * @returns WorkflowTimeLineDTO
   */
  public getWorkflowTimeline(workflowId: number): Observable<WorkflowTimelineDTO> {
    return this.http
      .get<WorkflowTimelineDTO>(`${this.env.apiBaseUrl}${this.WORKFLOW_PATH}/${workflowId}${this.TIMELINE_PATH}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Obtener Cards Limits Configuration Workflow
   *
   * @returns WorkflowHoursLimitsDTO
   */
  public getWorkflowCardsLimitsConfiguration(workflowId: number): Observable<WorkflowCardsLimitDTO> {
    return this.http
      .get<WorkflowCardsLimitDTO>(`${this.env.apiBaseUrl}${this.WORKFLOW_PATH}/${workflowId}${this.CARDS_LIMIT_PATH}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
  /**
   * Editar Cards Limits Configuration Workflow
   *
   * @returns boolean
   */
  public setWorkflowCardsLimitsConfiguration(data: WorkflowCardsLimitDTO): Observable<boolean> {
    return this.http
      .post<boolean>(`${this.env.apiBaseUrl}${this.WORKFLOW_PATH}${this.CARDS_LIMIT_PATH}`, data)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Editar Timeline Workflow
   *
   * @returns WorkflowTimeLineDTO
   */
  public postWorkflowTimeline(workflowId: number, workflowTimeline: WorkflowTimelineDTO): Observable<WorkflowTimelineDTO> {
    return this.http
      .post<WorkflowTimelineDTO>(
        `${this.env.apiBaseUrl}${this.WORKFLOW_PATH}/${workflowId}${this.TIMELINE_PATH}`,
        workflowTimeline
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Retrieves the attachments for a workflow template.
   *
   * @param id The ID of the workflow template.
   * @returns An Observable that emits an array of TemplateAtachmentItemsDTO.
   */
  public getWorkflowTemplateAttachments(id: number): Observable<TemplateAtachmentItemsDTO[]> {
    return this.http
      .get<TemplateAtachmentItemsDTO[]>(`${this.env.apiBaseUrl}${this.WORKFLOW_PATH}${this.TEMPLATE_ATTACHMENTS_PATH}/${id}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Obtener Timeline Workflow
   *
   * @returns WorkflowTimeLineDTO
   */
  public getWorkflowTimelineAttachments(workflowId: number): Observable<WorkflowAttachmentTimelineDTO[]> {
    return this.http
      .get<WorkflowAttachmentTimelineDTO[]>(
        `${this.env.apiBaseUrl}${this.WORKFLOW_PATH}/${workflowId}${this.TIMELINE_PATH}${this.ATTACHMENTS_PATH}`
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Obtener Budget Workflow
   *
   * @returns WorkflowTimeLineDTO
   */
  public getWorkflowBudget(workflowId: number): Observable<TemplatesCommonDTO> {
    return this.http
      .get<TemplatesCommonDTO>(`${this.env.apiBaseUrl}${this.WORKFLOW_PATH}/${workflowId}${this.BUDGET_PATH}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Editar Budget Workflow
   *
   * @returns WorkflowTimeLineDTO
   */
  public postWorkflowBudget(workflowId: number, budget: TemplatesCommonDTO): Observable<TemplatesCommonDTO> {
    return this.http
      .post<TemplatesCommonDTO>(`${this.env.apiBaseUrl}${this.WORKFLOW_PATH}/${workflowId}${this.BUDGET_PATH}`, budget)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
  /**
   * Validar workflow
   *
   * @returns unknown
   */
  public validateWorkflow(workflowId: number): Observable<unknown> {
    return this.http
      .get<unknown>(`${this.env.apiBaseUrl}${this.WORKFLOW_PATH}${this.VALIDATE_PATH}/${workflowId}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Cambiar estado workflow
   *
   * @return unknown
   */
  public changeStatus(workflowId: number, status: WorkFlowStatusEnum): Observable<unknown> {
    return this.http
      .get<unknown>(`${this.env.apiBaseUrl}${this.WORKFLOW_PATH}${this.CHANGE_STATUS_PATH}/${workflowId}/${status}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
}
