/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENV } from '@app/constants/global.constants';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
import PaginationRequestI from '@data/interfaces/pagination-request';
import PaginationResponseI from '@data/interfaces/pagination-response';
import BasicFilterDTO from '@data/models/basic-filter-dto';
import CardContentSourceDTO from '@data/models/cards/card-content-source-dto';
import CardContentTypeDTO from '@data/models/cards/card-content-type-dto';
import CardCreateDTO from '@data/models/cards/card-create-dto';
import CardDTO from '@data/models/cards/card-dto';
import CardInstanceDTO from '@data/models/cards/card-instance-dto';
import TemplatesCommonDTO from '@data/models/templates/templates-common-dto';
import WorkflowCardDTO from '@data/models/workflows/workflow-card-dto';
import WorkflowCardSlotDTO from '@data/models/workflows/workflow-card-slot-dto';
import WorkflowCardTabItemDTO from '@data/models/workflows/workflow-card-tab-item-dto';
import WorkflowMoveDTO from '@data/models/workflows/workflow-move-dto';
import { getPaginationUrlGetParams } from '@data/utils/pagination-aux';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CardService {
  private readonly GET_CARD_PATH = '/api/cards';
  private readonly GET_CARD_INSTANCE_PATH = '/api/cardInstanceWorkflow';
  private readonly GET_DETAIL_PATH = '/detail';
  private readonly GET_TAB_PATH = '/tab';
  private readonly GET_MOVEMENTS_PATH = '/movements';
  private readonly START_FOLLOW = '/startFollow';
  private readonly STOP_FOLLOW = '/stopFollow';
  private readonly SEARCH_CARDS_PATH = '/api/cards/search';
  private readonly SEARCH_CONTENT_TYPES_PATH = '/api/contenttypes/findAllByTabType/';
  private readonly SEARCH_CONTENT_SOURCES_PATH = '/api/contentsources/findAllByContentType/';
  private readonly SEARCH_ATTRS_ENTITY_PATH = '/api/variables/contentSource/';
  private readonly DUPLICATE_CARDS_PATH = '/api/cards/duplicate';
  private readonly DELETE_CARDS_PATH = '/api/cards';
  private readonly GET_CARD_INSTANCE_CREATE_PATH = '/api/cardInstanceWorkflow/createCard/';
  private readonly GET_CARD_CREATE_PATH = '/getCard';
  private readonly GET_DETAIL_TAB_PATH = '/getDetailTab';
  private readonly CREATE_CARD_INSTANCE_PATH = '/api/cardInstanceWorkflow/createCard';
  private readonly GET_TEMPLATE_LIST_PATH = '/api/templates/listByFilter';
  private readonly ENTITY_PATH = '/entity';
  private readonly SYNCRONIZE_PATH = '/synchronize';

  constructor(@Inject(ENV) private env: Env, private http: HttpClient) {}

  /**
   * Get all Cards
   *
   * @returns CardDTO
   */
  public getAllCards(): Observable<CardDTO[]> {
    return this.http
      .get<CardDTO[]>(`${this.env.apiBaseUrl}${this.GET_CARD_PATH}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
  /**
   * Get card by id
   *
   * @returns CardDTO
   */
  public getCardById(id: number): Observable<CardDTO> {
    return this.http
      .get<CardDTO>(`${this.env.apiBaseUrl}${this.GET_CARD_PATH}/${id}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Sync card
   */
  public syncCard(idCard: number): Observable<any> {
    return this.http.get<any>(
      `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_PATH}${this.GET_DETAIL_PATH}/${idCard}${this.SYNCRONIZE_PATH}`
    );
  }

  /**
   * Get card instance detail by id
   *
   * @returns any
   */
  public getCardInstanceDetailById(idCard: number, idUser?: number): Observable<CardInstanceDTO> {
    let url = `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_PATH}${this.GET_DETAIL_PATH}/${idCard}`;
    if (idUser) {
      url = `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_PATH}${this.GET_DETAIL_PATH}/${idCard}/${idUser}`;
    }
    return this.http.get<CardInstanceDTO>(url).pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Get card's movements
   *
   * @param idCard
   * @returns
   */
  public getCardInstanceMovements(
    idCard: number,
    type: 'SHORTCUT' | 'SAMEWF' | 'OTHERWF' = 'SAMEWF'
  ): Observable<WorkflowMoveDTO[]> {
    let url = `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_PATH}${this.GET_DETAIL_PATH}/${idCard}${this.GET_MOVEMENTS_PATH}`;
    if (type === 'SHORTCUT') {
      url += `/shortcut`;
    } else if (type === 'OTHERWF') {
      url += `/others/1`;
    } else {
      url += '/others/0';
    }
    return this.http.get<WorkflowMoveDTO[]>(url).pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Get card tab data
   *
   * @param cardInstanceWorkflowId
   * @param tabId
   * @returns WorkflowCardSlotDTO[]
   */
  public getCardTabData(
    cardInstanceWorkflowId: number,
    tabId: number
  ): Observable<WorkflowCardSlotDTO[] | WorkflowCardTabItemDTO[]> {
    return this.http
      .get<WorkflowCardSlotDTO[] | WorkflowCardTabItemDTO[]>(
        // eslint-disable-next-line max-len
        `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_PATH}${this.GET_DETAIL_PATH}/${cardInstanceWorkflowId}${this.GET_TAB_PATH}/${tabId}`
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Follow card
   *
   * @param follow
   * @param cardInstanceWorkflowId
   */
  public followCard(follow: boolean, cardInstanceWorkflowId: number): Observable<boolean> {
    const followPath = follow ? this.START_FOLLOW : this.STOP_FOLLOW;
    return this.http
      .get<boolean>(`${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_PATH}${followPath}/${cardInstanceWorkflowId}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Create edit card
   *
   * @returns CardDTO
   */
  public createEditCard(card: CardDTO): Observable<CardDTO> {
    return this.http
      .post<CardDTO>(`${this.env.apiBaseUrl}${this.GET_CARD_PATH}`, card)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  public searchCards(cardFilter: BasicFilterDTO, pagination?: PaginationRequestI): Observable<PaginationResponseI<CardDTO>> {
    return this.http
      .post<PaginationResponseI<CardDTO>>(
        `${this.env.apiBaseUrl}${this.SEARCH_CARDS_PATH}${getPaginationUrlGetParams(pagination, true)}`,
        cardFilter
      )
      .pipe(catchError((error) => throwError(error as ConcenetError)));
  }

  public duplicateCard(id: number): Observable<CardDTO> {
    return this.http
      .get<CardDTO>(`${this.env.apiBaseUrl}${this.DUPLICATE_CARDS_PATH}/${id}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  public deleteCard(id: number): Observable<CardDTO> {
    return this.http
      .delete<CardDTO>(`${this.env.apiBaseUrl}${this.DELETE_CARDS_PATH}/${id}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  public getContentTypes(cardType: string): Observable<CardContentTypeDTO[]> {
    return this.http
      .get<CardContentTypeDTO[]>(`${this.env.apiBaseUrl}${this.SEARCH_CONTENT_TYPES_PATH}${cardType}`)
      .pipe(catchError((error) => throwError(error as ConcenetError)));
  }

  public getContentSources(contentTypeId: number): Observable<CardContentSourceDTO[]> {
    return this.http
      .get<CardContentSourceDTO[]>(`${this.env.apiBaseUrl}${this.SEARCH_CONTENT_SOURCES_PATH}${contentTypeId}`)
      .pipe(catchError((error) => throwError(error as ConcenetError)));
  }

  public getEntityAttributes(contentSourceId: number): Observable<WorkflowCardSlotDTO[]> {
    return this.http
      .get<WorkflowCardSlotDTO[]>(`${this.env.apiBaseUrl}${this.SEARCH_ATTRS_ENTITY_PATH}${contentSourceId}`)
      .pipe(catchError((error) => throwError(error as ConcenetError)));
  }
  /**
   * Get card tab data on create
   *
   * @param cardInstanceWorkflowId
   * @param tabId
   * @returns WorkflowCardSlotDTO[]
   */
  public getCardCreateTabData(cardInstanceWorkflowId: number): Observable<CardDTO> {
    return this.http
      .get<CardDTO>(
        // eslint-disable-next-line max-len
        `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_CREATE_PATH}${cardInstanceWorkflowId}${this.GET_CARD_CREATE_PATH}`
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Get entity card data
   *
   * @param cardInstanceWorkflowId
   * @param tabId
   * @returns WorkflowCardSlotDTO[]
   */
  public getEntityCardTabData(
    workflowId: number,
    tabId: number,
    entityId?: number
  ): Observable<WorkflowCardSlotDTO[] | WorkflowCardTabItemDTO[]> {
    // eslint-disable-next-line max-len
    let url = `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_CREATE_PATH}${workflowId}${this.GET_DETAIL_TAB_PATH}/${tabId}`;
    if (entityId) {
      // eslint-disable-next-line max-len
      url = `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_CREATE_PATH}${workflowId}${this.GET_DETAIL_TAB_PATH}/${tabId}/${entityId}`;
    }
    return this.http
      .get<WorkflowCardSlotDTO[] | WorkflowCardTabItemDTO[]>(url)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Create edit card-intance
   *
   * @returns CardDTO
   */
  public createCardInstance(card: CardCreateDTO): Observable<CardDTO> {
    return this.http
      .post<CardDTO>(`${this.env.apiBaseUrl}${this.CREATE_CARD_INSTANCE_PATH}`, card)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Get list of templates
   *
   * @returns TemplatesCommonDTO
   */
  public listTemplates(templateType: string): Observable<TemplatesCommonDTO[]> {
    return this.http
      .post<TemplatesCommonDTO[]>(`${this.env.apiBaseUrl}${this.GET_TEMPLATE_LIST_PATH}`, { templateType })
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Edita un tab de tipo entity asignandole el nuevo seleccionado y devolviendo su detalle.
   *
   * @returns WorkflowCardTabItemDTO
   */
  public setEntityToTab(cardWfId: number, tabId: number, entityId: number): Observable<WorkflowCardTabItemDTO> {
    return this.http
      .get<WorkflowCardTabItemDTO>(
        // eslint-disable-next-line max-len
        `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_PATH}${this.GET_DETAIL_PATH}/${cardWfId}${this.ENTITY_PATH}/${tabId}/${entityId}`
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
}
