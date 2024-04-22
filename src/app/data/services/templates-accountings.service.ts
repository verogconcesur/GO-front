import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENV } from '@app/constants/global.constants';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
import PaginationRequestI from '@data/interfaces/pagination-request';
import PaginationResponseI from '@data/interfaces/pagination-response';
import { TemplatesAccountingDTO } from '@data/models/templates/templates-accounting-dto';
import TemplatesCommonDTO from '@data/models/templates/templates-common-dto';
import TemplatesFilterDTO from '@data/models/templates/templates-filter-dto';
import { getPaginationUrlGetParams } from '@data/utils/pagination-aux';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TemplatesAccountingsService {
  private readonly SEARCH_ACCOUNTING_PATH = '/api/templates/search';
  private readonly POST_ACCOUNTING_PATH = '/api/templateaccounting';
  private readonly TEMPLATE_TYPE = 'ACCOUNTING';

  constructor(@Inject(ENV) private env: Env, private http: HttpClient) {}

  public searchAccountingTemplates(
    templateFilter: TemplatesFilterDTO,
    pagination?: PaginationRequestI
  ): Observable<PaginationResponseI<TemplatesCommonDTO>> {
    return this.http
      .post<PaginationResponseI<TemplatesCommonDTO>>(
        `${this.env.apiBaseUrl}${this.SEARCH_ACCOUNTING_PATH}${getPaginationUrlGetParams(pagination, true)}`,
        { ...templateFilter, templateType: this.TEMPLATE_TYPE }
      )
      .pipe(catchError((error) => throwError(error as ConcenetError)));
  }

  public findById(id: number): Observable<TemplatesAccountingDTO> {
    return this.http
      .get<TemplatesAccountingDTO>(`${this.env.apiBaseUrl}${this.POST_ACCOUNTING_PATH}/${id}`)
      .pipe(catchError((error) => throwError(error as ConcenetError)));
  }

  public addOrEditAccounting(data: TemplatesAccountingDTO): Observable<TemplatesAccountingDTO> {
    return this.http
      .post<TemplatesAccountingDTO>(`${this.env.apiBaseUrl}${this.POST_ACCOUNTING_PATH}`, {
        ...data,
        template: {
          ...data.template,
          templateType: this.TEMPLATE_TYPE
        }
      })
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  public deleteAccountingById(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.env.apiBaseUrl}${this.POST_ACCOUNTING_PATH}/${id}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
}
