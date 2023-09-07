/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENV } from '@app/constants/global.constants';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
import { CardPaymentLineDTO, CardPaymentsDTO, PaymentTypeDTO } from '@data/models/cards/card-payments-dto';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CardPaymentsService {
  private readonly GET_CARD_INSTANCE_PATH = '/api/cardInstanceWorkflow';
  private readonly DETAIL_PATH = '/detail';
  private readonly EDIT_PATH = '/edit';
  private readonly PAYMENTS_PATH = '/payments';
  private readonly LINE_PATH = '/line';
  private readonly TYPES = '/types';
  private readonly STATE = '/status';

  constructor(@Inject(ENV) private env: Env, private http: HttpClient) {}

  /**
   * Get card payments
   *
   * @param cardInstanceWorkflowId
   * @param tabId
   * @returns CardPaymentsDTO
   */
  public getCardPayments(cardInstanceWorkflowId: number, tabId: number): Observable<CardPaymentsDTO> {
    return this.http
      .get<CardPaymentsDTO>(
        // eslint-disable-next-line max-len
        `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_PATH}${this.DETAIL_PATH}/${cardInstanceWorkflowId}${this.PAYMENTS_PATH}/${tabId}`
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Add lines to card tab
   *
   * @param cardInstanceWorkflowId
   * @param tabId
   * @param lines
   * @returns CardPaymentsDTO
   */
  public addEditLine(cardInstanceWorkflowId: number, tabId: number, line: CardPaymentLineDTO): Observable<CardPaymentsDTO> {
    return this.http
      .post<CardPaymentsDTO>(
        // eslint-disable-next-line max-len
        `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_PATH}${this.DETAIL_PATH}/${cardInstanceWorkflowId}${this.PAYMENTS_PATH}/${tabId}${this.LINE_PATH}`,
        line
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Delete payment line
   *
   * @param cardInstanceWorkflowId
   * @param tabId
   * @param idLine
   * @returns CardPaymentsDTO
   */
  public deleteLine(cardInstanceWorkflowId: number, tabId: number, idLine: number): Observable<CardPaymentsDTO> {
    return this.http
      .delete<CardPaymentsDTO>(
        // eslint-disable-next-line max-len
        `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_PATH}${this.DETAIL_PATH}/${cardInstanceWorkflowId}${this.PAYMENTS_PATH}/${tabId}${this.LINE_PATH}/${idLine}`
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Save Total information
   *
   * @param cardInstanceWorkflowId
   * @param tabId
   * @param paymentDto
   * @returns CardPaymentsDTO
   */
  public saveTotal(cardInstanceWorkflowId: number, tabId: number, payment: CardPaymentsDTO): Observable<CardPaymentsDTO> {
    return this.http
      .post<CardPaymentsDTO>(
        // eslint-disable-next-line max-len
        `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_PATH}${this.DETAIL_PATH}/${cardInstanceWorkflowId}${this.PAYMENTS_PATH}/${tabId}`,
        payment
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
  /**
   * Get card payments
   *
   * @param cardInstanceWorkflowId
   * @param tabId
   * @returns CardPaymentsDTO
   */
  public getCardPaymentTypes(): Observable<PaymentTypeDTO[]> {
    return this.http
      .get<PaymentTypeDTO[]>(
        // eslint-disable-next-line max-len
        `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_PATH}${this.PAYMENTS_PATH}${this.TYPES}`
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
  /**
   * Get card payments
   *
   * @param cardInstanceWorkflowId
   * @param tabId
   * @returns CardPaymentsDTO
   */
  public getCardPaymentStates(): Observable<PaymentTypeDTO[]> {
    return this.http
      .get<PaymentTypeDTO[]>(
        // eslint-disable-next-line max-len
        `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_PATH}${this.PAYMENTS_PATH}${this.STATE}`
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
}
