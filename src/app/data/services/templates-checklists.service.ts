import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENV } from '@app/constants/global.constants';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
import PaginationRequestI from '@data/interfaces/pagination-request';
import PaginationResponseI from '@data/interfaces/pagination-response';
import { CardAttachmentsDTO } from '@data/models/cards/card-attachments-dto';
import TemplatesChecklistsDTO, { SignDocumentExchangeDTO } from '@data/models/templates/templates-checklists-dto';
import TemplatesFilterDTO from '@data/models/templates/templates-filter-dto';
import { getPaginationUrlGetParams } from '@data/utils/pagination-aux';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TemplatesChecklistsService {
  private readonly CARD_INSTANCE_PATH = '/api/cardInstanceWorkflow/detail';
  private readonly SEARCH_COMMUNICATIONS_PATH = '/api/templates/search';
  private readonly TEMPLATE_CHECKLIST_PATH = '/api/templatechecklists';
  private readonly TEMPLATE_CHECKLIST = '/templateChecklist';
  private readonly TEMPLATE_ATTACHMENTS = '/attachments';
  private readonly TEMPLATE_SIGN_DOCUMENT = '/signDocument';
  private readonly CARD_INSTANCE_WORKFLOW = '/cardInstanceWorkflow';
  private readonly ATTACHMENTS = '/attachments';
  private readonly CATEGORY = '/category';
  private readonly TEMPLATE_TYPE = 'CHECKLISTS';
  constructor(@Inject(ENV) private env: Env, private http: HttpClient) {}

  public searchChecklistsTemplates(
    templateFilter: TemplatesFilterDTO,
    pagination?: PaginationRequestI
  ): Observable<PaginationResponseI<TemplatesChecklistsDTO>> {
    return this.http
      .post<PaginationResponseI<TemplatesChecklistsDTO>>(
        `${this.env.apiBaseUrl}${this.SEARCH_COMMUNICATIONS_PATH}${getPaginationUrlGetParams(pagination, true)}`,
        { ...templateFilter, templateType: this.TEMPLATE_TYPE }
      )
      .pipe(catchError((error) => throwError(error as ConcenetError)));
  }

  public findChecklistById(id: number): Observable<TemplatesChecklistsDTO> {
    return this.http
      .get<TemplatesChecklistsDTO>(`${this.env.apiBaseUrl}${this.TEMPLATE_CHECKLIST_PATH}/${id}`)
      .pipe(catchError((error) => throwError(error as ConcenetError)));
  }

  public getTemplatesChecklistByWCardId(id: number): Observable<TemplatesChecklistsDTO[]> {
    return this.http
      .get<TemplatesChecklistsDTO[]>(`${this.env.apiBaseUrl}${this.CARD_INSTANCE_PATH}/${id}${this.TEMPLATE_CHECKLIST}`)
      .pipe(catchError((error) => throwError(error as ConcenetError)));
  }

  public getAttachmentsChecklistByWCardId(id: number): Observable<CardAttachmentsDTO[]> {
    return this.http
      .get<CardAttachmentsDTO[]>(`${this.env.apiBaseUrl}${this.CARD_INSTANCE_PATH}/${id}${this.TEMPLATE_ATTACHMENTS}`)
      .pipe(catchError((error) => throwError(error as ConcenetError)));
  }

  public addOrEditChecklist(data: TemplatesChecklistsDTO): Observable<TemplatesChecklistsDTO> {
    return this.http
      .post<TemplatesChecklistsDTO>(`${this.env.apiBaseUrl}${this.TEMPLATE_CHECKLIST_PATH}`, {
        ...data,
        template: {
          ...data.template,
          templateType: this.TEMPLATE_TYPE
        },
        templateChecklistItems: [...data.templateChecklistItems],
        templateFile: {
          ...data.templateFile
        }
      })
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  public deleteChecklistById(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.env.apiBaseUrl}${this.TEMPLATE_CHECKLIST_PATH}/${id}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  public signDocument(wcid: number, signFile: SignDocumentExchangeDTO): Observable<SignDocumentExchangeDTO> {
    return this.http
      .post<SignDocumentExchangeDTO>(
        // eslint-disable-next-line max-len
        `${this.env.apiBaseUrl}${this.TEMPLATE_CHECKLIST_PATH}${this.CARD_INSTANCE_WORKFLOW}/${wcid}${this.TEMPLATE_SIGN_DOCUMENT}`,
        signFile
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  public saveDocument(
    wcid: number,
    attId: number,
    catId: number,
    signFile: SignDocumentExchangeDTO
  ): Observable<SignDocumentExchangeDTO> {
    return this.http
      .post<SignDocumentExchangeDTO>(
        // eslint-disable-next-line max-len
        `${this.env.apiBaseUrl}${this.TEMPLATE_CHECKLIST_PATH}${this.CARD_INSTANCE_WORKFLOW}/${wcid}${this.ATTACHMENTS}/${attId}${this.CATEGORY}` +
          `/${catId}${this.TEMPLATE_SIGN_DOCUMENT}`,
        signFile
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
}
