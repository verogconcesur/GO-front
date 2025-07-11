/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENV } from '@app/constants/global.constants';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
import { AttachmentDTO, CardAttachmentsDTO, CustomerAttachmentDTO } from '@data/models/cards/card-attachments-dto';
import CardInstanceRemoteSignatureDTO from '@data/models/cards/card-instance-remote-signature-dto';
import { BehaviorSubject, Observable, Subject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CardAttachmentsService {
  public remoteSignatureSubject$: Subject<CardInstanceRemoteSignatureDTO> = new Subject();
  public attachmentsFormSource = new BehaviorSubject<any>(null);
  public attachmentsForm$ = this.attachmentsFormSource.asObservable();
  private readonly GET_CARD_INSTANCE_PATH = '/api/cardInstanceWorkflow';
  private readonly DETAIL_PATH = '/detail';
  private readonly ATTACHMETS_PATH = '/attachments';
  private readonly CUSTOMERS_PATH = '/api/customers';
  private readonly CUSTOMER_AUTO = '/editAuto';
  private readonly CUSTOMER_ACTIVE = '/editActive';
  private readonly EDIT_PATH = '/edit';
  private readonly DELETE_PATH = '/delete';
  private readonly DOWNLOAD_PATH = '/download';
  private readonly HIDE_LANDING_PATH = '/hideLanding';
  private readonly SEND_REMOTE_SIGNATURE_PATH = '/sendRemoteSignature';
  private readonly CANCEL_REMOTE_SIGNATURE_PATH = '/cancelRemoteSignature';
  private readonly ATTACHMENTS_CUSTOMER_PATH = 'attachmentsCustomer';
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

  public getCustomerAttachments(clientId: number): Observable<CustomerAttachmentDTO[]> {
    return this.http
      .get<CustomerAttachmentDTO[]>(
        // eslint-disable-next-line max-len
        `${this.env.apiBaseUrl}${this.CUSTOMERS_PATH}/${clientId}${this.ATTACHMETS_PATH}`
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  public getCustomerAttachmentsByWorkflowId(ciwId: number, clientId: number): Observable<CustomerAttachmentDTO[]> {
    return this.http
      .get<CustomerAttachmentDTO[]>(
        // eslint-disable-next-line max-len
        `${this.env.apiBaseUrl}${this.CUSTOMERS_PATH}/${ciwId}/${clientId}${this.ATTACHMETS_PATH}`
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

  public saveAttachmentsCustomers(clienId: number, attachments: any) {
    return this.http
      .post<any>(
        `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_PATH}${this.DETAIL_PATH}/${clienId}/${this.ATTACHMENTS_CUSTOMER_PATH}`,
        attachments
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  public editCustomerAttachment(customerId: number, fileId: number, newName: string): Observable<any> {
    return this.http
      .post<any>(
        `${this.env.apiBaseUrl}${this.CUSTOMERS_PATH}/` + `${customerId}${this.ATTACHMETS_PATH}/${fileId}${this.EDIT_PATH}`,
        {
          file: {
            name: newName
          }
        }
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
  public autoCustomerAttachments(customerId: number, attachmentId: number, auto: boolean) {
    return this.http
      .get(
        `${this.env.apiBaseUrl}${this.CUSTOMERS_PATH}/` +
          `${customerId}${this.ATTACHMETS_PATH}/${attachmentId}${this.CUSTOMER_AUTO}/${auto}`
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
  public addClientAttachments(clientId: number, files: any): Observable<any> {
    return this.http
      .post<any>(`${this.env.apiBaseUrl}${this.CUSTOMERS_PATH}/` + `${clientId}${this.ATTACHMETS_PATH}`, files)
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

  public deleteCustomerAttachment(customerId: number, fileId: number): Observable<any> {
    return this.http
      .delete<any>(
        `${this.env.apiBaseUrl}${this.CUSTOMERS_PATH}/` + `${customerId}${this.ATTACHMETS_PATH}/${fileId}${this.DELETE_PATH}`
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  public moveAttachment(attachmentId: number, customerId: number, active: boolean): Observable<any> {
    return this.http
      .get(
        `${this.env.apiBaseUrl}${this.CUSTOMERS_PATH}/` +
          `${customerId}${this.ATTACHMETS_PATH}/${attachmentId}${this.CUSTOMER_ACTIVE}/${active}`
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

  public downloadCustomerAttachment(customerId: number, fileId: number): Observable<CustomerAttachmentDTO> {
    const url =
      `${this.env.apiBaseUrl}${this.CUSTOMERS_PATH}/` + `${customerId}${this.ATTACHMETS_PATH}/${fileId}${this.DOWNLOAD_PATH}`;
    return this.http.get<CustomerAttachmentDTO>(url).pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  public downloadAttachmentByCardInstance(cardInstanceWorkflowId: number, fileId: number): Observable<AttachmentDTO> {
    return this.http
      .get<AttachmentDTO>(
        `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_PATH}${this.DETAIL_PATH}/` +
          `${cardInstanceWorkflowId}${this.ATTACHMETS_PATH}${this.DOWNLOAD_PATH}/${fileId}`
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
  public updateAttachmentsForm(data: any) {
    this.attachmentsFormSource.next(data);
  }
}
