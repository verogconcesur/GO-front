import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENV } from '@app/constants/global.constants';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
import PaginationRequestI from '@data/interfaces/pagination-request';
import PaginationResponseI from '@data/interfaces/pagination-response';
import TemplatesCommonDTO from '@data/models/templates/templates-common-dto';
import TemplatesCommunicationDTO from '@data/models/templates/templates-communication-dto';
import TemplatesFilterDTO from '@data/models/templates/templates-filter-dto';
import { getPaginationUrlGetParams } from '@data/utils/pagination-aux';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TemplatesCommunicationService {
  private readonly POST_COMMUNICATIONS_PATH = '/api/templatecomunications';
  private readonly SEARCH_COMMUNICATIONS_PATH = '/api/templates/search';
  private readonly TEMPLATE_TYPE = 'COMUNICATION';

  constructor(@Inject(ENV) private env: Env, private http: HttpClient) {}

  public searchCommunicationsTemplates(
    templateFilter: TemplatesFilterDTO,
    pagination?: PaginationRequestI
  ): Observable<PaginationResponseI<TemplatesCommonDTO>> {
    return this.http
      .post<PaginationResponseI<TemplatesCommonDTO>>(
        `${this.env.apiBaseUrl}${this.SEARCH_COMMUNICATIONS_PATH}${getPaginationUrlGetParams(pagination, true)}`,
        { ...templateFilter, templateType: this.TEMPLATE_TYPE }
      )
      .pipe(catchError((error) => throwError(error as ConcenetError)));
  }

  public findById(id: number): Observable<TemplatesCommunicationDTO> {
    return this.http
      .get<TemplatesCommunicationDTO>(`${this.env.apiBaseUrl}${this.POST_COMMUNICATIONS_PATH}/${id}`)
      .pipe(catchError((error) => throwError(error as ConcenetError)));
  }

  public addOrEditCommunication(data: TemplatesCommunicationDTO): Observable<TemplatesCommunicationDTO> {
    return this.http
      .post<TemplatesCommunicationDTO>(`${this.env.apiBaseUrl}${this.POST_COMMUNICATIONS_PATH}`, {
        ...data,
        template: {
          ...data.template,
          templateType: this.TEMPLATE_TYPE
        }
      })
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  public deleteCommunicationById(budgetId: number): Observable<void> {
    return this.http
      .delete<void>(`${this.env.apiBaseUrl}${this.POST_COMMUNICATIONS_PATH}/${budgetId}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
}
