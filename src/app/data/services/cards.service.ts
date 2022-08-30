/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENV } from '@app/constants/global.constants';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
import CardDTO from '@data/models/cards/card-dto';
import CardInstanceDTO from '@data/models/cards/card-instance-dto';
import WorkflowCardSlotDTO from '@data/models/workflows/workflow-card-slot-dto';
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

  constructor(@Inject(ENV) private env: Env, private http: HttpClient) {}

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
   * Get card instance detail by id
   *
   * @returns any
   */
  public getCardInstanceDetailById(id: number): Observable<CardInstanceDTO> {
    return this.http
      .get<CardInstanceDTO>(`${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_PATH}${this.GET_DETAIL_PATH}/${id}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Get card tab data
   *
   * @param cardInstanceWorkflowId
   * @param tabId
   * @returns WorkflowCardSlotDTO[]
   */
  public getCardTabData(cardInstanceWorkflowId: number, tabId: number): Observable<WorkflowCardSlotDTO[]> {
    return this.http
      .get<WorkflowCardSlotDTO[]>(
        // eslint-disable-next-line max-len
        `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_PATH}${this.GET_DETAIL_PATH}/${cardInstanceWorkflowId}${this.GET_TAB_PATH}/${tabId}`
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
}
