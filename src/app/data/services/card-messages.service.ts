import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENV } from '@app/constants/global.constants';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
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
}
