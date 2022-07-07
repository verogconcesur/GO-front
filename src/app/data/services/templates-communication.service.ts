import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENV } from '@app/constants/global.constants';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
import PaginationRequestI from '@data/interfaces/pagination-request';
import PaginationResponseI from '@data/interfaces/pagination-response';
import RoleDTO from '@data/models/role-dto';
import TemplatesCommunicationDTO from '@data/models/templates-communication-dto';
import TemplatesFilterDTO from '@data/models/templates-filter-dto';
import { getPaginationUrlGetParams } from '@data/utils/pagination-aux';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TemplatesCommunicationService {
  private readonly SEARCH_COMMUNICATIONS_PATH = '/api/templates/search';
  private readonly TEMPLATE_TYPE = 'COMUNICATION';

  constructor(@Inject(ENV) private env: Env, private http: HttpClient) {}

  public searchCommunicationsTemplates(
    templateFilter: TemplatesFilterDTO,
    pagination?: PaginationRequestI
  ): Observable<PaginationResponseI<TemplatesCommunicationDTO>> {
    return this.http
      .post<PaginationResponseI<TemplatesCommunicationDTO>>(
        `${this.env.apiBaseUrl}${this.SEARCH_COMMUNICATIONS_PATH}${getPaginationUrlGetParams(pagination, true)}`,
        { ...templateFilter, templateType: this.TEMPLATE_TYPE }
      )
      .pipe(catchError((error) => throwError(error as ConcenetError)));
  }
}
