import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENV } from '@app/constants/global.constants';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
import CardInstanceWhatsappDTO from '@data/models/cards/card-instance-whatsapp-dto';
import CardMessageDTO from '@data/models/cards/card-message';
import CardMessageRenderDTO from '@data/models/cards/card-message-render';
import TemplatesCommonDTO from '@data/models/templates/templates-common-dto';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CardMessagesService {
  private readonly GET_CARD_INSTANCE_PATH = '/api/cardInstanceWorkflow';
  private readonly GET_DETAIL_PATH = '/detail';
  private readonly GET_MESSAGES_PATH = '/messages';
  private readonly LIST_TEMPLATES = '/listTemplates';
  private readonly TEMPLATE = '/template';
  private readonly CHANNELS = '/channels';
  private readonly SEND = '/send';
  private readonly SENDLINE = '/sendLine';
  private readonly SENDLINEPEPPER = '/sendLinePepper';
  private readonly BUDGET = '/budget';
  private readonly WHATSAPP_PATH = '/whatsapp';
  private readonly PAYMENT = '/payment';
  private readonly PAYMENTS = '/payments';
  private readonly CONVERSATION_PATH = '/conversation';
  private readonly ACTIVE_PATH = '/active';

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

  /**
   * Obtener listado de templates para mensaje de cliente
   *
   * @returns TemplatesCommonDTO[]
   */
  public getMessageTemplates(cardWfId: number, ids: number[]): Observable<TemplatesCommonDTO[]> {
    return this.http
      .get<TemplatesCommonDTO[]>(
        // eslint-disable-next-line max-len
        `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_PATH}${this.GET_DETAIL_PATH}/${cardWfId}${this.LIST_TEMPLATES}/${ids.join(
          ','
        )}`
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Obtener listado de mensajes renderizados para cliente
   *
   * @returns CardMessageRenderDTO[]
   */
  public getMessageClients(cardWfId: number, templateId: number, ids: number[]): Observable<CardMessageRenderDTO[]> {
    return this.http
      .get<CardMessageRenderDTO[]>(
        // eslint-disable-next-line max-len
        `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_PATH}${this.GET_DETAIL_PATH}${this.GET_MESSAGES_PATH}/${cardWfId}${
          this.TEMPLATE
        }/${templateId}${this.CHANNELS}/${ids.join(',')}`
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Obtener listado de mensajes renderizados para cliente
   *
   * @returns CardMessageRenderDTO[]
   */
  public sendMessageClients(
    cardWfId: number,
    ids: number[],
    messages: CardMessageRenderDTO[]
  ): Observable<CardMessageRenderDTO[]> {
    return this.http
      .post<CardMessageRenderDTO[]>(
        // eslint-disable-next-line max-len
        `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_PATH}${this.GET_DETAIL_PATH}${this.GET_MESSAGES_PATH}${
          this.SEND
        }/${cardWfId}${this.CHANNELS}/${ids.join(',')}`,
        messages
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Envía el presupuesto al cliente
   *
   * @returns unknown
   */
  public sendBudgetMessageClient(cardWfId: number, tabId: number): Observable<unknown> {
    return this.http
      .post<unknown>(
        // eslint-disable-next-line max-len
        `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_PATH}${this.GET_DETAIL_PATH}${this.GET_MESSAGES_PATH}${this.SEND}/${cardWfId}${this.BUDGET}/${tabId}`,
        {}
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
  /**
   * Envía línea de pago al cliente
   *
   * @returns unknown
   */
  public sendPaymentMessageClient(cardWfId: number, paymentLineId: number): Observable<unknown> {
    return this.http
      .post<unknown>(
        // eslint-disable-next-line max-len
        `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_PATH}${this.GET_DETAIL_PATH}${this.GET_MESSAGES_PATH}${this.SEND}/${cardWfId}${this.PAYMENT}/${paymentLineId}`,
        {}
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Envía línea de pago sms/email
   *
   * @returns unknown
   */
  public sendPaymentMessageBySmsOrEmail(cardWfId: number, tabId: number, paymentLineId: number): Observable<unknown> {
    return this.http
      .get<unknown>(
        // eslint-disable-next-line max-len
        `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_PATH}${this.GET_DETAIL_PATH}/${cardWfId}${this.PAYMENTS}/${tabId}${this.SENDLINE}/${paymentLineId}`,
        {}
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Envía línea de pago pepper
   *
   * @returns unknown
   */
  public sendPaymentMessageByPepper(cardWfId: number, tabId: number, paymentLineId: number): Observable<unknown> {
    return this.http
      .get<unknown>(
        // eslint-disable-next-line max-len
        `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_PATH}${this.GET_DETAIL_PATH}/${cardWfId}${this.PAYMENTS}/${tabId}${this.SENDLINEPEPPER}/${paymentLineId}`,
        {}
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Inicia conversación por whatsapp
   *
   * @returns CardInstanceWhatsappDTO
   */
  public sendWhatsappConversation(
    cardInstanceWhatsapp: CardInstanceWhatsappDTO,
    cardWfId: number,
    messageId?: number
  ): Observable<null> {
    let url =
      `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_PATH}${this.GET_DETAIL_PATH}${this.WHATSAPP_PATH}` +
      `/${cardWfId}${this.CONVERSATION_PATH}`;
    if (messageId) {
      url += `/${messageId}`;
    }
    return this.http.post<null>(url, cardInstanceWhatsapp).pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Obtener la conversación activa actual
   *
   * @returns CardInstanceWhatsappDTO
   */
  public getWhatsappConversationMessages(cardWfId: number, messageId: number): Observable<CardInstanceWhatsappDTO[]> {
    return this.http
      .get<CardInstanceWhatsappDTO[]>(
        `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_PATH}${this.GET_DETAIL_PATH}${this.WHATSAPP_PATH}` +
          `/${cardWfId}${this.CONVERSATION_PATH}/${messageId}`
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Obtener la conversación activa actual
   *
   * @returns CardInstanceWhatsappDTO
   */
  public checkWhatsappConversationActive(cardWfId: number): Observable<CardInstanceWhatsappDTO> {
    return this.http
      .get<CardInstanceWhatsappDTO>(
        `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_PATH}${this.GET_DETAIL_PATH}${this.WHATSAPP_PATH}` +
          `/${cardWfId}${this.CONVERSATION_PATH}${this.ACTIVE_PATH}`
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
}
