/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENV } from '@app/constants/global.constants';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
import {
  CardPaymentLineDTO,
  CardPaymentsDTO,
  CardTotalDetailDTO,
  CardTotalLineDTO,
  PaymentDescriptionDTO,
  PaymentPosibleDescriptionDTO,
  PaymentTypeDTO
} from '@data/models/cards/card-payments-dto';
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
  private readonly DESCRIPTIONS = '/descriptions';
  private readonly STATE = '/status';
  private readonly ACCOUNT = '/account';
  private readonly TOTAL = '/total';
  private readonly TOTAL_DETAIL = '/totalDetail';

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
   * Adds or edits a total detail for a card instance workflow.
   *
   * @param cardInstanceWorkflowId - The ID of the card instance workflow.
   * @param tabId - The ID of the tab.
   * @param line - The total detail to add or edit.
   * @returns An Observable of type CardPaymentsDTO.
   */
  public addEditTotalDetail(
    cardInstanceWorkflowId: number,
    tabId: number,
    line: CardTotalDetailDTO
  ): Observable<CardPaymentsDTO> {
    return this.http
      .post<CardPaymentsDTO>(
        // eslint-disable-next-line max-len
        `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_PATH}${this.DETAIL_PATH}/${cardInstanceWorkflowId}${this.PAYMENTS_PATH}/${tabId}${this.TOTAL_DETAIL}`,
        line
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Add total lines to card tab
   *
   * @param cardInstanceWorkflowId
   * @param tabId
   * @param line
   * @returns CardPaymentsDTO
   */
  public addEditTotalLine(cardInstanceWorkflowId: number, tabId: number, line: CardTotalLineDTO): Observable<CardTotalLineDTO> {
    return this.http
      .post<CardTotalLineDTO>(
        // eslint-disable-next-line max-len
        `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_PATH}${this.DETAIL_PATH}/${cardInstanceWorkflowId}${this.PAYMENTS_PATH}/${tabId}${this.TOTAL}`,
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
   * Delete total line
   *
   * @param cardInstanceWorkflowId
   * @param tabId
   * @param idLine
   * @returns CardPaymentsDTO
   */
  public deleteTotalLine(cardInstanceWorkflowId: number, tabId: number, idLine: number): Observable<CardPaymentsDTO> {
    return this.http
      .delete<CardPaymentsDTO>(
        // eslint-disable-next-line max-len
        `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_PATH}${this.DETAIL_PATH}/${cardInstanceWorkflowId}${this.PAYMENTS_PATH}/${tabId}${this.TOTAL}/${idLine}`
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  public deleteTotalDetailLine(cardInstanceWorkflowId: number, tabId: number, idLine: number): Observable<CardPaymentsDTO> {
    return this.http
      .delete<CardPaymentsDTO>(
        // eslint-disable-next-line max-len
        `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_PATH}${this.DETAIL_PATH}/${cardInstanceWorkflowId}${this.PAYMENTS_PATH}/${tabId}${this.TOTAL_DETAIL}/${idLine}`
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
   * Save Customer account information
   *
   * @param cardInstanceWorkflowId
   * @param tabId
   * @param customerAccount
   * @param paymentDto
   * @returns boolean
   */
  public saveCustomerAccount(cardInstanceWorkflowId: number, tabId: number, payment: CardPaymentsDTO): Observable<boolean> {
    return this.http
      .post<boolean>(
        // eslint-disable-next-line max-len
        `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_PATH}${this.DETAIL_PATH}/${cardInstanceWorkflowId}${this.PAYMENTS_PATH}/${tabId}${this.ACCOUNT}`,
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
   * Retrieves the card description types.
   *
   * @returns An Observable that emits an array of Payment's details objects.
   */
  public getCardDesciptionsTypes(): Observable<PaymentPosibleDescriptionDTO> {
    return this.http
      .get<PaymentPosibleDescriptionDTO>(
        // eslint-disable-next-line max-len
        `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_PATH}${this.PAYMENTS_PATH}${this.DESCRIPTIONS}`
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
  public getCardPaymentStatus(): Observable<PaymentTypeDTO[]> {
    return this.http
      .get<PaymentTypeDTO[]>(
        // eslint-disable-next-line max-len
        `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_PATH}${this.PAYMENTS_PATH}${this.STATE}`
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
}
