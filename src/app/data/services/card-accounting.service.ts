/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENV } from '@app/constants/global.constants';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
import { CardAccountingBlockDTO, CardAccountingDTO, CardAccountingLineDTO } from '@data/models/cards/card-accounting-dto';
import { AccountingTaxTypeDTO } from '@data/models/templates/templates-accounting-dto';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CardAccountingService {
  private lastEditedLineId: string | null = null;
  private readonly GET_CARD_INSTANCE_PATH = '/api/cardInstanceWorkflow';
  private readonly DETAIL_PATH = '/detail';
  private readonly ACCOUNTING_PATH = '/accounting';
  private readonly ACCOUNTING_LINE_PATH = '/accountingLine';
  private readonly ACCOUNTING_BLOCK_PATH = '/accountingBlock';
  private readonly SET_TAX_TYPE_PATH = '/setTaxType';
  private readonly LOCKED = '/locked';

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

  public setTaxType(cardInstanceWorkflowId: number, tabId: number, taxType: AccountingTaxTypeDTO): Observable<CardAccountingDTO> {
    if (!taxType.id) {
      taxType.value = null;
      taxType.description = null;
    }
    return this.http
      .post<CardAccountingDTO>(
        // eslint-disable-next-line max-len
        `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_PATH}${this.DETAIL_PATH}/${cardInstanceWorkflowId}${this.ACCOUNTING_LINE_PATH}/${tabId}${this.SET_TAX_TYPE_PATH}`,
        taxType
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  public editLine(cardInstanceWorkflowId: number, tabId: number, line: CardAccountingLineDTO): Observable<boolean> {
    return this.http
      .post<boolean>(
        // eslint-disable-next-line max-len
        `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_PATH}${this.DETAIL_PATH}/${cardInstanceWorkflowId}${this.ACCOUNTING_LINE_PATH}/${tabId}`,
        line
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  public disableEnableAccpuntingTab(cardInstanceWorkflowId: number, tabId: number, status: number) {
    return this.http
      .get(
        // eslint-disable-next-line max-len
        `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_PATH}${this.DETAIL_PATH}/${cardInstanceWorkflowId}${this.ACCOUNTING_PATH}/${tabId}${this.LOCKED}/${status}`
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
  public editBlock(cardInstanceWorkflowId: number, tabId: number, block: CardAccountingBlockDTO): Observable<boolean> {
    return this.http
      .post<boolean>(
        // eslint-disable-next-line max-len
        `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_PATH}${this.DETAIL_PATH}/${cardInstanceWorkflowId}${this.ACCOUNTING_BLOCK_PATH}/${tabId}`,
        block
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
  public setLastEditedLineId(lineId: string): void {
    this.lastEditedLineId = lineId;
  }

  public getLastEditedLineId(): string | null {
    return this.lastEditedLineId;
  }
}
