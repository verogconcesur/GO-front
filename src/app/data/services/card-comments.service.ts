/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENV } from '@app/constants/global.constants';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
import CardCommentDTO from '@data/models/cards/card-comment';
import UserDetailsDTO from '@data/models/user-permissions/user-details-dto';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CardCommentsService {
  private readonly GET_CARD_INSTANCE_PATH = '/api/cardInstanceWorkflow';
  private readonly GET_DETAIL_PATH = '/detail';
  private readonly GET_COMMENTS_PATH = '/comments';
  private readonly GET_USERS_MENTION_PATH = '/usersMention';

  constructor(@Inject(ENV) private env: Env, private http: HttpClient) {}

  /**
   * Get card comments
   *
   * @param cardInstanceWorkflowId
   * @returns CardCommentDTO[]
   */
  public getCardComments(cardInstanceWorkflowId: number): Observable<CardCommentDTO[]> {
    return this.http
      .get<CardCommentDTO[]>(
        // eslint-disable-next-line max-len
        `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_PATH}${this.GET_DETAIL_PATH}${this.GET_COMMENTS_PATH}/${cardInstanceWorkflowId}`
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Get card users available to mention
   *
   * @param cardInstanceWorkflowId
   * @returns
   */
  public getCardUsersMention(cardInstanceWorkflowId: number): Observable<UserDetailsDTO[]> {
    return this.http
      .get<UserDetailsDTO[]>(
        // eslint-disable-next-line max-len
        `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_PATH}${this.GET_DETAIL_PATH}${this.GET_COMMENTS_PATH}${this.GET_USERS_MENTION_PATH}/${cardInstanceWorkflowId}`
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
}
