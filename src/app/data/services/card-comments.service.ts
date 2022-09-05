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
  private readonly ADD_PATH = '/add';
  private readonly READ_PATH = '/read';
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

  public addCardComment(cardInstanceWorkflowId: number, comment: CardCommentDTO): Observable<CardCommentDTO> {
    return this.http
      .post<CardCommentDTO>(
        // eslint-disable-next-line max-len
        `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_PATH}${this.GET_DETAIL_PATH}${this.GET_COMMENTS_PATH}${this.ADD_PATH}/${cardInstanceWorkflowId}`,
        comment
      )
      .pipe(catchError((error) => throwError(error as ConcenetError)));
  }

  public setCommentsAsRead(cardInstanceCommentId: number): Observable<any> {
    return this.http
      .get<any>(
        // eslint-disable-next-line max-len
        `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_PATH}${this.GET_DETAIL_PATH}${this.GET_COMMENTS_PATH}${this.READ_PATH}/${cardInstanceCommentId}`
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
}
