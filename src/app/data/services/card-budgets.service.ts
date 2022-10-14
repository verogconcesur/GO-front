/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENV } from '@app/constants/global.constants';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
import { CardBudgetsDTO } from '@data/models/cards/card-budgets-dto';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CardBudgetsService {
  private readonly GET_CARD_INSTANCE_PATH = '/api/cardInstanceWorkflow';
  private readonly DETAIL_PATH = '/detail';
  private readonly EDIT_PATH = '/edit';
  private readonly BUDGETS_PATH = '/budget';
  private readonly TEMPLATE_PATH = '/template';

  constructor(@Inject(ENV) private env: Env, private http: HttpClient) {}

  /**
   * Get card budgets
   *
   * @param cardInstanceWorkflowId
   * @param tabId
   * @returns CardBudgetsDTO[]
   */
  public getCardBudgets(cardInstanceWorkflowId: number, tabId: number): Observable<CardBudgetsDTO[]> {
    return this.http
      .get<CardBudgetsDTO[]>(
        // eslint-disable-next-line max-len
        `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_PATH}${this.DETAIL_PATH}/${cardInstanceWorkflowId}${this.BUDGETS_PATH}/${tabId}`
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Get template budgets
   *
   * @param cardInstanceWorkflowId
   * @param tabId
   * @returns CardBudgetsDTO[]
   */
  public getLinesTemplate(cardInstanceWorkflowId: number, tabId: number): Observable<CardBudgetsDTO[]> {
    return this.http
      .get<CardBudgetsDTO[]>(
        // eslint-disable-next-line max-len
        `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_PATH}${this.DETAIL_PATH}/${cardInstanceWorkflowId}${this.BUDGETS_PATH}/${tabId}${this.TEMPLATE_PATH}`
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Add lines to card tab
   *
   * @param cardInstanceWorkflowId
   * @param tabId
   * @param lines
   * @returns CardBudgetsDTO[]
   */
  public addLines(cardInstanceWorkflowId: number, tabId: number, lines: CardBudgetsDTO[]): Observable<CardBudgetsDTO[]> {
    return this.http
      .post<CardBudgetsDTO[]>(
        // eslint-disable-next-line max-len
        `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_PATH}${this.DETAIL_PATH}/${cardInstanceWorkflowId}${this.BUDGETS_PATH}/${tabId}`,
        lines
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Edit budget line
   *
   * @param cardInstanceWorkflowId
   * @param tabId
   * @param line
   * @returns CardBudgetsDTO
   */
  public editLine(cardInstanceWorkflowId: number, tabId: number, line: CardBudgetsDTO): Observable<CardBudgetsDTO> {
    return this.http
      .post<CardBudgetsDTO>(
        // eslint-disable-next-line max-len
        `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_PATH}${this.DETAIL_PATH}/${cardInstanceWorkflowId}${this.BUDGETS_PATH}/${tabId}${this.EDIT_PATH}`,
        line
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Delete budget line
   *
   * @param cardInstanceWorkflowId
   * @param tabId
   * @param idLine
   * @returns CardBudgetsDTO
   */
  public deleteLine(cardInstanceWorkflowId: number, tabId: number, idLine: number): Observable<CardBudgetsDTO> {
    return this.http
      .delete<CardBudgetsDTO>(
        // eslint-disable-next-line max-len
        `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_PATH}${this.DETAIL_PATH}/${cardInstanceWorkflowId}${this.BUDGETS_PATH}/${tabId}/${idLine}`
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
}
