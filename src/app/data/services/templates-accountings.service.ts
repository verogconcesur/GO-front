import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENV } from '@app/constants/global.constants';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
import PaginationRequestI from '@data/interfaces/pagination-request';
import PaginationResponseI from '@data/interfaces/pagination-response';
import {
  AccountingBlockTypeDTO,
  AccountingLineTypeDTO,
  AccountingTaxTypeDTO,
  TemplateAccountingItemLineDTO,
  TemplatesAccountingDTO
} from '@data/models/templates/templates-accounting-dto';
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
  private readonly BLOCK_TYPES_PATH = '/listAccountingBlockTypes';
  private readonly LINE_TYPES_PATH = '/listAccountingLineTypes';
  private readonly LIST_TAX_TYPES = '/listTaxTypes';
  private readonly LIST_SIMPLE_LINES_BY_TEMPLATE = '/listLinesSimpleByTemplate';
  private readonly DELETE_LINE = '/deleteLine';
  private readonly DELETE_BLOCK = '/deleteBlock';
  private readonly SAVE_LINE = '/saveLine';
  private readonly ORDER_LINES = '/orderLines';
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

  public getListAccountingBlockTypes(): Observable<AccountingBlockTypeDTO[]> {
    return this.http
      .get<AccountingBlockTypeDTO[]>(`${this.env.apiBaseUrl}${this.POST_ACCOUNTING_PATH}${this.BLOCK_TYPES_PATH}`)
      .pipe(catchError((error) => throwError(error as ConcenetError)));
  }

  public getListAccountingLineTypes(): Observable<AccountingLineTypeDTO[]> {
    return this.http
      .get<AccountingLineTypeDTO[]>(`${this.env.apiBaseUrl}${this.POST_ACCOUNTING_PATH}${this.LINE_TYPES_PATH}`)
      .pipe(catchError((error) => throwError(error as ConcenetError)));
  }

  public getListTaxTypes(): Observable<AccountingTaxTypeDTO[]> {
    return this.http
      .get<AccountingTaxTypeDTO[]>(`${this.env.apiBaseUrl}${this.POST_ACCOUNTING_PATH}${this.LIST_TAX_TYPES}`)
      .pipe(catchError((error) => throwError(error as ConcenetError)));
  }

  public getListSimpleLinesByTemplate(templateId: number): Observable<TemplateAccountingItemLineDTO[]> {
    return this.http
      .get<TemplateAccountingItemLineDTO[]>(
        `${this.env.apiBaseUrl}${this.POST_ACCOUNTING_PATH}${this.LIST_SIMPLE_LINES_BY_TEMPLATE}/${templateId}`
      )
      .pipe(catchError((error) => throwError(error as ConcenetError)));
  }

  public deleteLine(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.env.apiBaseUrl}${this.POST_ACCOUNTING_PATH}${this.DELETE_LINE}/${id}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  public deleteBlock(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.env.apiBaseUrl}${this.POST_ACCOUNTING_PATH}${this.DELETE_BLOCK}/${id}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  public saveLine(data: TemplateAccountingItemLineDTO): Observable<TemplateAccountingItemLineDTO> {
    return this.http
      .post<TemplateAccountingItemLineDTO>(`${this.env.apiBaseUrl}${this.POST_ACCOUNTING_PATH}${this.SAVE_LINE}`, data)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  public orderLines(orderedIdLines: number[]): Observable<void> {
    return this.http
      .post<void>(`${this.env.apiBaseUrl}${this.POST_ACCOUNTING_PATH}${this.ORDER_LINES}`, orderedIdLines)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
}
