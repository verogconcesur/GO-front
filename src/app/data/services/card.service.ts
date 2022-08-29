import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENV } from '@app/constants/global.constants';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
import PaginationRequestI from '@data/interfaces/pagination-request';
import PaginationResponseI from '@data/interfaces/pagination-response';
import BasicFilterDTO from '@data/models/basic-filter-dto';
import CardDto from '@data/models/cards/card-dto';
import { getPaginationUrlGetParams } from '@data/utils/pagination-aux';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CardService {
  private readonly SEARCH_CARDS_PATH = '/api/cards/search';
  private readonly DUPLICATE_CARDS_PATH = '/api/cards/duplicate';
  private readonly DELETE_CARDS_PATH = '/api/cards';

  constructor(@Inject(ENV) private env: Env, private http: HttpClient) {}

  public searchCards(cardFilter: BasicFilterDTO, pagination?: PaginationRequestI): Observable<PaginationResponseI<CardDto>> {
    return this.http
      .post<PaginationResponseI<CardDto>>(
        `${this.env.apiBaseUrl}${this.SEARCH_CARDS_PATH}${getPaginationUrlGetParams(pagination, true)}`,
        cardFilter
      )
      .pipe(catchError((error) => throwError(error as ConcenetError)));
  }

  public duplicateCard(id: number): Observable<CardDto> {
    return this.http
      .get<CardDto>(`${this.env.apiBaseUrl}${this.DUPLICATE_CARDS_PATH}/${id}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  public deleteCard(id: number): Observable<CardDto> {
    return this.http
      .delete<CardDto>(`${this.env.apiBaseUrl}${this.DELETE_CARDS_PATH}/${id}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
}
