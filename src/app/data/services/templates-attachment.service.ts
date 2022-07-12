import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENV } from '@app/constants/global.constants';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
import PaginationRequestI from '@data/interfaces/pagination-request';
import PaginationResponseI from '@data/interfaces/pagination-response';
import TemplatesAttachmentDTO from '@data/models/templates-attachment-dto';
import TemplatesCommonDTO from '@data/models/templates-common-dto';
import TemplatesCommunicationDTO from '@data/models/templates-communication-dto';
import TemplatesFilterDTO from '@data/models/templates-filter-dto';
import { getPaginationUrlGetParams } from '@data/utils/pagination-aux';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TemplatesAttachmentService {
  private readonly SEARCH_ATTACHMENTS_PATH = '/api/templates/search';
  private readonly TEMPLATE_TYPE = 'ATTACHMENTS';

  constructor(@Inject(ENV) private env: Env, private http: HttpClient) {}

  public searchAttachmentTemplates(
    templateFilter: TemplatesFilterDTO,
    pagination?: PaginationRequestI
  ): Observable<PaginationResponseI<TemplatesCommonDTO>> {
    return this.http
      .post<PaginationResponseI<TemplatesCommonDTO>>(
        `${this.env.apiBaseUrl}${this.SEARCH_ATTACHMENTS_PATH}${getPaginationUrlGetParams(pagination, true)}`,
        { ...templateFilter, templateType: this.TEMPLATE_TYPE }
      )
      .pipe(catchError((error) => throwError(error as ConcenetError)));
  }
}
