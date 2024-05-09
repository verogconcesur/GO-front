/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENV } from '@app/constants/global.constants';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
import { CardAccountingDTO } from '@data/models/cards/card-accounting-dto';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CardAccountingService {
  private readonly GET_CARD_INSTANCE_PATH = '/api/cardInstanceWorkflow';
  private readonly DETAIL_PATH = '/detail';
  private readonly ACCOUNTING_PATH = '/accounting';

  constructor(@Inject(ENV) private env: Env, private http: HttpClient) {}

  /**
   * Get card payments
   *
   * @param cardInstanceWorkflowId
   * @param tabId
   * @returns CardAccountingDTO
   */
  public getCardAccounting(cardInstanceWorkflowId: number, tabId: number): Observable<CardAccountingDTO> {
    return this.http
      .get<CardAccountingDTO>(
        // eslint-disable-next-line max-len
        `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_PATH}${this.DETAIL_PATH}/${cardInstanceWorkflowId}${this.ACCOUNTING_PATH}/${tabId}`
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
}
