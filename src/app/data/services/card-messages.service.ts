import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENV } from '@app/constants/global.constants';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
import CardMessageDTO from '@data/models/cards/card-message';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CardMessagesService {
  private readonly GET_CARD_INSTANCE_PATH = '/api/cardInstanceWorkflow';
  private readonly GET_DETAIL_PATH = '/detail';
  private readonly GET_MESSAGES_PATH = '/messages';

  constructor(@Inject(ENV) private env: Env, private http: HttpClient) {}

  /**
   * Get card messages
   *
   * @param cardInstanceWorkflowId
   * @returns CardMessageDTO[]
   */
  public getCardMessages(cardInstanceWorkflowId: number): Observable<CardMessageDTO[]> {
    return this.http
      .get<CardMessageDTO[]>(
        // eslint-disable-next-line max-len
        `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_PATH}${this.GET_DETAIL_PATH}${this.GET_MESSAGES_PATH}/${cardInstanceWorkflowId}`
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
}
