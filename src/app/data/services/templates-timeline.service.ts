import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENV } from '@app/constants/global.constants';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
import PaginationRequestI from '@data/interfaces/pagination-request';
import PaginationResponseI from '@data/interfaces/pagination-response';
import TemplatesCommonDTO from '@data/models/templates/templates-common-dto';
import TemplatesFilterDTO from '@data/models/templates/templates-filter-dto';
import TemplatesTimelineDTO from '@data/models/templates/templates-timeline-dto';
import { getPaginationUrlGetParams } from '@data/utils/pagination-aux';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TemplatesTimelineService {
  private readonly SEARCH_TIMELINES_PATH = '/api/templates/search';
  private readonly POST_TIMELINES_PATH = '/api/templatetimelines';
  private readonly TEMPLATE_TYPE = 'TIMELINE';

  constructor(@Inject(ENV) private env: Env, private http: HttpClient) {}

  public searchTimelineTemplates(
    templateFilter: TemplatesFilterDTO,
    pagination?: PaginationRequestI
  ): Observable<PaginationResponseI<TemplatesCommonDTO>> {
    return this.http
      .post<PaginationResponseI<TemplatesCommonDTO>>(
        `${this.env.apiBaseUrl}${this.SEARCH_TIMELINES_PATH}${getPaginationUrlGetParams(pagination, true)}`,
        { ...templateFilter, templateType: this.TEMPLATE_TYPE }
      )
      .pipe(catchError((error) => throwError(error as ConcenetError)));
  }

  public findById(id: number): Observable<TemplatesTimelineDTO> {
    return this.http
      .get<TemplatesTimelineDTO>(`${this.env.apiBaseUrl}${this.POST_TIMELINES_PATH}/${id}`)
      .pipe(catchError((error) => throwError(error as ConcenetError)));
  }

  public addOrEditTimeline(data: TemplatesTimelineDTO): Observable<TemplatesTimelineDTO> {
    return this.http
      .post<TemplatesTimelineDTO>(`${this.env.apiBaseUrl}${this.POST_TIMELINES_PATH}`, {
        ...data,
        template: {
          ...data.template,
          templateType: this.TEMPLATE_TYPE
        }
      })
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  public deleteTimelineById(budgetId: number): Observable<void> {
    return this.http
      .delete<void>(`${this.env.apiBaseUrl}${this.POST_TIMELINES_PATH}/${budgetId}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
}
