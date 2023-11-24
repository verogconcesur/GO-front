/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENV } from '@app/constants/global.constants';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
import FacilityDTO from '@data/models/organization/facility-dto';
import WorkflowCardDTO from '@data/models/workflows/workflow-card-dto';
import WorkflowCardInstanceDTO from '@data/models/workflows/workflow-card-instance-dto';
import WorkflowCreateCardDTO from '@data/models/workflows/workflow-create-card-dto';
import WorkflowSubstateEventDTO from '@data/models/workflows/workflow-substate-event-dto';
import WorkflowDTO from '@data/models/workflows/workflow-dto';
import WorkflowMoveDTO from '@data/models/workflows/workflow-move-dto';
import WorkflowStateDTO from '@data/models/workflows/workflow-state-dto';
import WorkflowSubstateUserDTO from '@data/models/workflows/workflow-substate-user-dto';
import { WorkflowFilterService } from '@modules/app-modules/workflow/aux-service/workflow-filter.service';
import { BehaviorSubject, Observable, Subject, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { WorkflowSearchFilterDTO } from '@data/models/workflows/workflow-filter-dto';
import PaginationRequestI from '@data/interfaces/pagination-request';
import { getPaginationUrlGetParams } from '@data/utils/pagination-aux';
import PaginationResponseI from '@data/interfaces/pagination-response';
import { RouteConstants } from '@app/constants/route.constants';
import { CardLimitSlotByDayDTO } from '@data/models/workflow-admin/workflow-card-limit-dto';
import WorkflowCalendarBodyDTO from '@data/models/workflows/workflow-calendar-body-dto';

@Injectable({
  providedIn: 'root'
})
export class WorkflowsService {
  //Stores the selected workflow.
  public workflowSelectedSubject$: BehaviorSubject<WorkflowDTO> = new BehaviorSubject(null);
  //Stores the selected view.
  public workflowSelectedView$: BehaviorSubject<RouteConstants | string> = new BehaviorSubject(null);
  //Stores the selected facility.
  public facilitiesSelectedSubject$: BehaviorSubject<FacilityDTO[]> = new BehaviorSubject([]);
  //Stores the selected workflow.
  public workflowHideCardsSubject$: Subject<boolean> = new Subject();

  private readonly GET_WORKFLOWS_PATH = '/api/workflows';
  private readonly GET_MOCK_WORKFLOWS_PATH = '/api/mock/workflow';
  private readonly GET_WORKFLOWS_CREATECARD_PATH = '/api/cardInstanceWorkflow/createCard/getWorkflows';
  private readonly GET_CARD_LIMITS_CREATECARD_PATH = '/api/cardInstanceWorkflow/createCard/getCardLimitSlots';
  private readonly GET_CARD_LIMITS_PATH = '/getCardLimitSlots';
  private readonly GET_WORKFLOWS_LIST_PATH = '/list';
  private readonly GET_WORKFLOWS_SEARCH_PATH = '/search';
  private readonly GET_WORKFLOWS_SEARCH_PAGED_PATH = '/searchPaged';
  private readonly DUPLICATE_WORKFLOWS_PATH = '/duplicate';
  private readonly GET_WORKFLOWS_FACILITY_PATH = '/facility';
  private readonly GET_WORKFLOWS_INSTANCE_PATH = '/instances';
  private readonly GET_WORKFLOWS_VIEW_PATH = '/view';
  private readonly GET_WORKFLOWS_CARDS_PATH = '/cards';
  private readonly GET_WORKFLOWS_CARD_PATH = '/card';
  private readonly GET_WORKFLOWS_MOVEMENT_PATH = '/movementByTarget';
  private readonly GET_WORKFLOW_MOVEMENT_PATH = '/workflowMovementByTarget';
  private readonly GET_CARD_INSTANCE_WORKFLOW = '/cardInstanceWorkflow';
  private readonly GET_WORKFLOWS_ORDER_PATH = '/orders';
  private readonly SYNCRONIZE_PATH = '/synchronize';
  private readonly GET_WORKFLOW_SUBSTATE_USERS_PATH = '/api/cardInstanceWorkflow/createCard/';
  private readonly GET_USERS_PATH = '/getUsers';
  private readonly GET_CALENDAR_PATH = '/calendar';
  private readonly REINDEX_CARDS_PATH = '/reindexCards';
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
   * Obtiene las tarjetas visibles para el usuario cuyos datos matrícula, vin, NIF/NIE o Referencia de la orden contenga el texto enviado.
   *
   * @returns WorkflowCardDTO[]
   */
  public searchCardsInWorkflows(search: string): Observable<WorkflowCardDTO[]> {
    return this.http
      .post<WorkflowCardDTO[]>(
        `${this.env.apiBaseUrl}${this.GET_WORKFLOWS_PATH}${this.GET_WORKFLOWS_INSTANCE_PATH}${this.GET_WORKFLOWS_SEARCH_PATH}`,
        { search }
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Obtiene las tarjetas visibles para el usuario cuyos datos matrícula, vin, NIF/NIE o Referencia de la orden contenga el texto enviado.
   *
   * @returns WorkflowCardDTO[]
   */
  public searchCardsInWorkflowsPaged(
    search: string,
    pagination?: PaginationRequestI
  ): Observable<PaginationResponseI<WorkflowCardDTO>> {
    return this.http
      .post<PaginationResponseI<WorkflowCardDTO>>(
        `${this.env.apiBaseUrl}${this.GET_WORKFLOWS_PATH}${this.GET_WORKFLOWS_INSTANCE_PATH}${
          this.GET_WORKFLOWS_SEARCH_PAGED_PATH
        }${getPaginationUrlGetParams(pagination, true)}`,
        { search }
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Obtiene las tarjetas visibles para el cliente o para el vehículo
   *
   * @returns WorkflowCardDTO[]
   */
  public searchCardsInWorkflowsByCustomerOrVehicleId(
    id: number,
    type: 'vehicleId' | 'customerId'
  ): Observable<WorkflowCardDTO[]> {
    let data = {};
    if (type === 'vehicleId') {
      data = {
        vehicleId: id
      };
    } else {
      data = {
        customerId: id
      };
    }
    return this.http
      .post<WorkflowCardDTO[]>(
        `${this.env.apiBaseUrl}${this.GET_WORKFLOWS_PATH}${this.GET_WORKFLOWS_INSTANCE_PATH}${this.GET_WORKFLOWS_SEARCH_PATH}`,
        data
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Devuelve listado de workflows paginado
   *
   * @returns WorkflowDTO[]
   */
  public searchWorkflows(
    filter: WorkflowSearchFilterDTO,
    pagination?: PaginationRequestI
  ): Observable<PaginationResponseI<WorkflowDTO>> {
    return this.http
      .post<PaginationResponseI<WorkflowDTO>>(
        `${this.env.apiBaseUrl}${this.GET_WORKFLOWS_PATH}${this.GET_WORKFLOWS_SEARCH_PATH}${getPaginationUrlGetParams(
          pagination,
          true
        )}`,
        filter
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Devuelve el listado de workflow que el usuario logado puede ver para la creación de una ficha.
   *
   * @returns CardLimitSlotByDayDTO[]
   */
  public getCardLimitsCreatecardList(
    workflowId: number,
    facilityId?: number,
    cardInstanceId?: number
  ): Observable<CardLimitSlotByDayDTO[]> {
    let url = '';
    if (facilityId) {
      url = `${this.env.apiBaseUrl}${this.GET_CARD_LIMITS_CREATECARD_PATH}/${workflowId}/${facilityId}`;
    } else if (cardInstanceId) {
      url =
        `${this.env.apiBaseUrl}${this.GET_WORKFLOWS_PATH}${this.GET_CARD_INSTANCE_WORKFLOW}/${cardInstanceId}` +
        `${this.GET_WORKFLOW_MOVEMENT_PATH}/getCardLimitSlots/${workflowId}`;
    }
    return this.http.get<CardLimitSlotByDayDTO[]>(url).pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Devuelve el listado fechas a partir de hoy con fichas en cada hora.
   *
   * @returns WorkflowDTO[]
   */
  public getWorkflowsCreatecardList(): Observable<WorkflowCreateCardDTO[]> {
    return this.http
      .get<WorkflowCreateCardDTO[]>(`${this.env.apiBaseUrl}${this.GET_WORKFLOWS_CREATECARD_PATH}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Get all states and substates of a workflow
   *
   * @param workflow WorkflowDTO
   * @returns
   */
  public getWorkflowInstances(
    workflow: WorkflowDTO,
    facilities: FacilityDTO[],
    viewType: 'BOARD' | 'CALENDAR' | 'TABLE',
    extractFilterInfo?: boolean
  ): Observable<WorkflowStateDTO[]> {
    let url = `${this.env.apiBaseUrl}${this.GET_WORKFLOWS_PATH}/${workflow.id}${this.GET_WORKFLOWS_VIEW_PATH}/${viewType}${this.GET_WORKFLOWS_INSTANCE_PATH}`;
    if (facilities.length) {
      url =
        `${this.env.apiBaseUrl}${this.GET_WORKFLOWS_PATH}/${workflow.id}${this.GET_WORKFLOWS_VIEW_PATH}/${viewType}` +
        `${this.GET_WORKFLOWS_FACILITY_PATH}/${facilities.map((f: FacilityDTO) => f.id).join(',')}` +
        `${this.GET_WORKFLOWS_INSTANCE_PATH}`;
    }
    return this.http.get<WorkflowStateDTO[]>(url).pipe(
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
  public getWorkflowCards(
    workflow: WorkflowDTO,
    facilities: FacilityDTO[],
    viewType: 'BOARD' | 'CALENDAR' | 'TABLE'
  ): Observable<WorkflowCardDTO[]> {
    let url =
      `${this.env.apiBaseUrl}${this.GET_WORKFLOWS_PATH}/${workflow.id}${this.GET_WORKFLOWS_VIEW_PATH}/` +
      `${viewType}${this.GET_WORKFLOWS_CARDS_PATH}`;
    if (facilities.length) {
      url =
        `${this.env.apiBaseUrl}${this.GET_WORKFLOWS_PATH}/${workflow.id}${this.GET_WORKFLOWS_VIEW_PATH}/${viewType}` +
        `${this.GET_WORKFLOWS_FACILITY_PATH}/${facilities.map((f: FacilityDTO) => f.id).join(',')}` +
        `${this.GET_WORKFLOWS_CARDS_PATH}`;
    }
    return this.http.get<WorkflowCardDTO[]>(url).pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Get one card of a workflow
   *
   * @param cardId number
   * @param viewType 'BOARD' | 'CALENDAR' | 'TABLE'
   * @returns
   */
  public getSingleWorkflowCard(cardId: number, viewType: 'BOARD' | 'CALENDAR' | 'TABLE'): Observable<WorkflowCardDTO> {
    return this.http
      .get<WorkflowCardDTO>(
        `${this.env.apiBaseUrl}${this.GET_WORKFLOWS_PATH}${this.GET_WORKFLOWS_VIEW_PATH}/${viewType}${this.GET_WORKFLOWS_CARD_PATH}/${cardId}`
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Get all cards of a workflow
   *
   * @param workflow WorkflowDTO
   * @returns
   */
  public getWorkflowCardsCalendar(workflow: WorkflowDTO, body: WorkflowCalendarBodyDTO): Observable<WorkflowCardDTO[]> {
    return this.http
      .post<WorkflowCardDTO[]>(`${this.env.apiBaseUrl}${this.GET_WORKFLOWS_PATH}/${workflow.id}${this.GET_CALENDAR_PATH}`, body)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Get one card of a workflow
   *
   * @param cardId number
   * @param viewType 'BOARD' | 'CALENDAR' | 'TABLE'
   * @returns
   */
  public getSingleWorkflowCalendarCard(
    workflow: WorkflowDTO,
    body: WorkflowCalendarBodyDTO,
    cardId: number
  ): Observable<WorkflowCardDTO> {
    return this.http
      .post<WorkflowCardDTO>(
        `${this.env.apiBaseUrl}${this.GET_WORKFLOWS_PATH}/${workflow.id}${this.GET_CALENDAR_PATH}/${cardId}`,
        body
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
    const cardInstanceWorkflow: WorkflowCardInstanceDTO = card.cardInstanceWorkflows[0];
    cardInstanceWorkflow.orderNumber = newOrderNumber;
    let url =
      `${this.env.apiBaseUrl}${this.GET_WORKFLOWS_PATH}/${card.cardInstanceWorkflows[0].workflowId}` +
      `${this.GET_WORKFLOWS_FACILITY_PATH}/${facilityId}${this.GET_WORKFLOWS_CARDS_PATH}${this.GET_WORKFLOWS_ORDER_PATH}`;
    if (wUser?.user) {
      url += `/${wUser.user.id}`;
    }
    return this.http
      .post<WorkflowCardInstanceDTO>(url, cardInstanceWorkflow)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Move card to another subState
   *
   * @param cardInstance
   * @param move
   * @param wUser
   * @returns
   */
  public moveWorkflowCardToSubstate(
    card: WorkflowCardDTO,
    targetId: number,
    wUser: WorkflowSubstateUserDTO,
    newOrderNumber: number,
    dateLimit?: number
  ): Observable<WorkflowMoveDTO[]> {
    const cardInstanceWorkflow: WorkflowCardInstanceDTO = card.cardInstanceWorkflows[0];
    cardInstanceWorkflow.orderNumber = newOrderNumber;
    cardInstanceWorkflow.cardInstanceId = card.id;
    cardInstanceWorkflow.cardInstanceWorkflowUsers[0].userId = wUser?.user ? wUser?.user?.id : null;
    cardInstanceWorkflow.dateAppliTimeLimit = dateLimit;
    return this.http
      .post<WorkflowMoveDTO[]>(
        `${this.env.apiBaseUrl}${this.GET_WORKFLOWS_PATH}/${card?.cardInstanceWorkflows[0]?.workflowId}` +
          `${this.GET_WORKFLOWS_MOVEMENT_PATH}/${targetId}`,
        cardInstanceWorkflow
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Reindex cards
   *
   * @param cardInstanceWorkflowds: number[]
   * @param workflowSubstateId: number
   * @returns boolean
   */
  public reindexCards(cardInstanceWorkflowds: number[], workflowSubstateId: number): Observable<boolean> {
    return this.http
      .post<boolean>(
        `${this.env.apiBaseUrl}${this.GET_WORKFLOWS_PATH}${this.GET_WORKFLOWS_INSTANCE_PATH}${this.REINDEX_CARDS_PATH}`,
        { cardInstanceWorkflowds, workflowSubstateId }
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  public deleteWorkflow(id: number): Observable<boolean> {
    return this.http
      .delete<boolean>(`${this.env.apiBaseUrl}${this.GET_WORKFLOWS_PATH}/${id}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  public duplicateWorkflow(id: number): Observable<boolean> {
    return this.http
      .get<boolean>(`${this.env.apiBaseUrl}${this.GET_WORKFLOWS_PATH}${this.DUPLICATE_WORKFLOWS_PATH}/${id}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  public prepareMovement(card: WorkflowCardDTO, targetId: number): Observable<WorkflowSubstateEventDTO[]> {
    return this.http
      .get<WorkflowSubstateEventDTO[]>(
        `${this.env.apiBaseUrl}${this.GET_WORKFLOWS_PATH}${this.GET_CARD_INSTANCE_WORKFLOW}/${card?.cardInstanceWorkflows[0]?.id}` +
          `${this.GET_WORKFLOW_MOVEMENT_PATH}/${targetId}`
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  public syncData(workflowId: number): Observable<any> {
    return this.http
      .get<any>(`${this.env.apiBaseUrl}${this.GET_WORKFLOWS_PATH}/${workflowId}${this.SYNCRONIZE_PATH}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  public getSubStateUsers(
    workflowId: number,
    workflowFacilityId: number,
    workflowSubStateId: number
  ): Observable<WorkflowSubstateUserDTO[]> {
    // console.log(card, move);
    return this.http
      .get<WorkflowSubstateUserDTO[]>(
        `${this.env.apiBaseUrl}${this.GET_WORKFLOW_SUBSTATE_USERS_PATH}${workflowId}/${workflowSubStateId}/${workflowFacilityId}${this.GET_USERS_PATH}`
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
}
