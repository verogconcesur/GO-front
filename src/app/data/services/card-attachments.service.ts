/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENV } from '@app/constants/global.constants';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
import { CardAttachmentsDTO } from '@data/models/cards/card-attachments-dto';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CardAttachmentsService {
  private readonly GET_CARD_INSTANCE_PATH = '/api/cardInstanceWorkflow';
  private readonly DETAIL_PATH = '/detail';
  private readonly ATTACHMETS_PATH = '/attachments';

  constructor(@Inject(ENV) private env: Env, private http: HttpClient) {}

  /**
   * Get card attachments
   *
   * @param cardInstanceWorkflowId
   * @param tabId
   * @returns CardAttachmentsDTO[]
   */
  public getCardAttachments(cardInstanceWorkflowId: number, tabId: number): Observable<CardAttachmentsDTO[]> {
    return this.http
      .get<CardAttachmentsDTO[]>(
        // eslint-disable-next-line max-len
        `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_PATH}${this.DETAIL_PATH}/${cardInstanceWorkflowId}${this.ATTACHMETS_PATH}/${tabId}`
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
}
