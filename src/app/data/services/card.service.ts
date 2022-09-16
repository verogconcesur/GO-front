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
import CardDTO from '@data/models/cards/card-dto';
import WorkflowCardSlotDTO from '@data/models/workflows/workflow-card-slot-dto';
import { getPaginationUrlGetParams } from '@data/utils/pagination-aux';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CardService {
  private readonly SEARCH_CARDS_PATH = '/api/cards/search';
  private readonly SEARCH_CONTENT_TYPES_PATH = '/api/contenttypes/findAllByTabType/';
  private readonly SEARCH_CONTENT_SOURCES_PATH = '/api/contentsources/findAllByContentType/';
  private readonly SEARCH_ATTRS_ENTITY_PATH = '/api/variables/contentSource/';
  private readonly DUPLICATE_CARDS_PATH = '/api/cards/duplicate';
  private readonly DELETE_CARDS_PATH = '/api/cards';

  constructor(@Inject(ENV) private env: Env, private http: HttpClient) {}

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
}
