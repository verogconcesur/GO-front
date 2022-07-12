import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENV } from '@app/constants/global.constants';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
import PaginationRequestI from '@data/interfaces/pagination-request';
import PaginationResponseI from '@data/interfaces/pagination-response';
import TemplatesBudgetDetailsDTO from '@data/models/templates-budget-details-dto';
import TemplatesBudgetDTO from '@data/models/templates-budget-dto';
import TemplatesFilterDTO from '@data/models/templates-filter-dto';
import { getPaginationUrlGetParams } from '@data/utils/pagination-aux';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TemplatesBudgetsService {
  private readonly SEARCH_COMMUNICATIONS_PATH = '/api/templates/search';
  private readonly POST_BUDGETS_PATH = '/api/templatebudgets';
  private readonly TEMPLATE_TYPE = 'BUDGET';

  constructor(@Inject(ENV) private env: Env, private http: HttpClient) {}

  public searchBudgetsTemplates(
    templateFilter: TemplatesFilterDTO,
    pagination?: PaginationRequestI
  ): Observable<PaginationResponseI<TemplatesBudgetDTO>> {
    return this.http
      .post<PaginationResponseI<TemplatesBudgetDTO>>(
        `${this.env.apiBaseUrl}${this.SEARCH_COMMUNICATIONS_PATH}${getPaginationUrlGetParams(pagination, true)}`,
        { ...templateFilter, templateType: this.TEMPLATE_TYPE }
      )
      .pipe(catchError((error) => throwError(error as ConcenetError)));
  }

  public findById(id: number): Observable<TemplatesBudgetDetailsDTO> {
    return this.http
      .get<TemplatesBudgetDetailsDTO>(`${this.env.apiBaseUrl}${this.POST_BUDGETS_PATH}/${id}`)
      .pipe(catchError((error) => throwError(error as ConcenetError)));
  }

  public addOrEditBudget(data: TemplatesBudgetDetailsDTO): Observable<TemplatesBudgetDetailsDTO> {
    return this.http
      .post<TemplatesBudgetDetailsDTO>(`${this.env.apiBaseUrl}${this.POST_BUDGETS_PATH}`, {
        ...data,
        template: {
          ...data.template,
          templateType: this.TEMPLATE_TYPE
        }
      })
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  public deleteBudgetById(budgetId: number): Observable<void> {
    return this.http
      .delete<void>(`${this.env.apiBaseUrl}${this.POST_BUDGETS_PATH}/${budgetId}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
}
