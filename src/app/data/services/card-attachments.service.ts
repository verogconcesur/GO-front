/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENV } from '@app/constants/global.constants';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
import { AttachmentDTO, CardAttachmentsDTO } from '@data/models/cards/card-attachments-dto';
import CardInstanceRemoteSignatureDTO from '@data/models/cards/card-instance-remote-signature-dto';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CardAttachmentsService {
  public remoteSignatureSubject$: Subject<CardInstanceRemoteSignatureDTO> = new Subject();

  private readonly GET_CARD_INSTANCE_PATH = '/api/cardInstanceWorkflow';
  private readonly DETAIL_PATH = '/detail';
  private readonly ATTACHMETS_PATH = '/attachments';
  private readonly EDIT_PATH = '/edit';
  private readonly DELETE_PATH = '/delete';
  private readonly DOWNLOAD_PATH = '/download';
  private readonly HIDE_LANDING_PATH = '/hideLanding';
  private readonly SEND_REMOTE_SIGNATURE_PATH = '/sendRemoteSignature';
  private readonly CANCEL_REMOTE_SIGNATURE_PATH = '/cancelRemoteSignature';

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

  /**
   * Get card attachments by instance
   *
   * @param cardInstanceWorkflowId
   * @returns CardAttachmentsDTO[]
   */
  public getCardAttachmentsByInstance(cardInstanceWorkflowId: number): Observable<CardAttachmentsDTO[]> {
    return this.http
      .get<CardAttachmentsDTO[]>(
        // eslint-disable-next-line max-len
        `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_PATH}${this.DETAIL_PATH}/${cardInstanceWorkflowId}${this.ATTACHMETS_PATH}`
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  public editAttachment(
    cardInstanceWorkflowId: number,
    tabId: number,
    fileId: number,
    newName: string,
    templateAttachmentItemId: number
  ): Observable<any> {
    return this.http
      .post<any>(
        `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_PATH}${this.DETAIL_PATH}/` +
          `${cardInstanceWorkflowId}${this.ATTACHMETS_PATH}/${tabId}${this.EDIT_PATH}`,
        {
          templateAttachmentItem: {
            id: templateAttachmentItemId
          },
          file: {
            id: fileId,
            name: newName
          }
        }
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  public addAttachments(
    cardInstanceWorkflowId: number,
    tabId: number,
    templateAttachmentItemId: number,
    files: { name: string; type: string; size: number; content: string }[]
  ): Observable<any> {
    return this.http
      .post<any>(
        `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_PATH}${this.DETAIL_PATH}/` +
          `${cardInstanceWorkflowId}${this.ATTACHMETS_PATH}/${tabId}`,
        {
          templateAttachmentItem: {
            id: templateAttachmentItemId
          },
          attachments: files
        }
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  public sendRemoteSignature(
    cardInstanceWorkflowId: number,
    templateChecklistId: number,
    fileId: number
  ): Observable<CardInstanceRemoteSignatureDTO> {
    return this.http
      .post<CardInstanceRemoteSignatureDTO>(
        `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_PATH}${this.DETAIL_PATH}/` +
          `${cardInstanceWorkflowId}${this.SEND_REMOTE_SIGNATURE_PATH}`,
        { templateChecklistId, fileId }
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  public cancelRemoteSignature(cardInstanceWorkflowId: number, remoteSignatureId: number): Observable<boolean> {
    return this.http
      .get<boolean>(
        `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_PATH}${this.DETAIL_PATH}/` +
          `${cardInstanceWorkflowId}${this.CANCEL_REMOTE_SIGNATURE_PATH}/${remoteSignatureId}`
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  public deleteAttachment(cardInstanceWorkflowId: number, tabId: number, fileId: number): Observable<any> {
    return this.http
      .delete<any>(
        `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_PATH}${this.DETAIL_PATH}/` +
          `${cardInstanceWorkflowId}${this.ATTACHMETS_PATH}/${tabId}${this.DELETE_PATH}/${fileId}`
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  public hideLanding(cardInstanceWorkflowId: number, tabId: number, fileId: number): Observable<boolean> {
    return this.http
      .get<boolean>(
        `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_PATH}${this.DETAIL_PATH}/` +
          `${cardInstanceWorkflowId}${this.ATTACHMETS_PATH}/${tabId}${this.HIDE_LANDING_PATH}/${fileId}`
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  public getDownloadAttachmentUrl(cardInstanceWorkflowId: number, tabId: number, fileId: number): string {
    return (
      `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_PATH}${this.DETAIL_PATH}/` +
      `${cardInstanceWorkflowId}${this.ATTACHMETS_PATH}/${tabId}${this.DOWNLOAD_PATH}/${fileId}`
    );
  }

  public downloadAttachment(cardInstanceWorkflowId: number, tabId: number, fileId: number): Observable<AttachmentDTO> {
    let url =
      `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_PATH}${this.DETAIL_PATH}/` +
      `${cardInstanceWorkflowId}${this.ATTACHMETS_PATH}/${tabId}${this.DOWNLOAD_PATH}/${fileId}`;
    if (!tabId) {
      url =
        `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_PATH}${this.DETAIL_PATH}/` +
        `${cardInstanceWorkflowId}${this.ATTACHMETS_PATH}${this.DOWNLOAD_PATH}/${fileId}`;
    }
    return this.http.get<AttachmentDTO>(url).pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  public downloadAttachmentByCardInstance(cardInstanceWorkflowId: number, fileId: number): Observable<AttachmentDTO> {
    return this.http
      .get<AttachmentDTO>(
        `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_PATH}${this.DETAIL_PATH}/` +
          `${cardInstanceWorkflowId}${this.ATTACHMETS_PATH}${this.DOWNLOAD_PATH}/${fileId}`
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
}
