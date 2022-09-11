/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENV } from '@app/constants/global.constants';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
import CardCommentDTO from '@data/models/cards/card-comment';
import CardHistoryDTO from '@data/models/cards/card-history';
import CardHistoryFilterDTO from '@data/models/cards/card-history-filter';
import UserDetailsDTO from '@data/models/user-permissions/user-details-dto';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CardHistoryService {
  private readonly GET_CARD_INSTANCE_PATH = '/api/cardInstanceWorkflow';
  private readonly GET_DETAIL_PATH = '/detail';
  private readonly HISTORY_PATH = '/history';
  private readonly SEARCH_PATH = '/search';

  constructor(@Inject(ENV) private env: Env, private http: HttpClient) {}

  /**
   * Get card history
   *
   * @param filter
   * @returns CardHistoryDTO[]
   */
  public getCardHistory(filter: CardHistoryFilterDTO): Observable<CardHistoryDTO[]> {
    return this.http
      .post<CardHistoryDTO[]>(
        // eslint-disable-next-line max-len
        `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_PATH}${this.GET_DETAIL_PATH}${this.HISTORY_PATH}${this.SEARCH_PATH}`,
        filter
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
}
