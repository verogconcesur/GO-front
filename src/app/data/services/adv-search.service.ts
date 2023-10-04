/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ENV } from '@app/constants/global.constants';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
import PaginationRequestI from '@data/interfaces/pagination-request';
import PaginationResponseI from '@data/interfaces/pagination-response';
import AdvSearchDTO from '@data/models/adv-search/adv-search-dto';
import AdvSearchOperatorDTO from '@data/models/adv-search/adv-search-operator-dto';
import AdvancedSearchOptionsDTO from '@data/models/adv-search/adv-search-options-dto';
import FileAsyncDTO from '@data/models/adv-search/file-async-dto';
import { AttachmentDTO } from '@data/models/cards/card-attachments-dto';
import WorkflowCreateCardDTO from '@data/models/workflows/workflow-create-card-dto';
import { getPaginationUrlGetParams } from '@data/utils/pagination-aux';
import { BehaviorSubject, Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdvSearchService {
  public newSearchExport$: BehaviorSubject<AdvSearchDTO> = new BehaviorSubject(null);
  private readonly GET_ADV_SEARCH_PATH = '/api/advancedSearch';
  private readonly DUPLICATE_PATH = '/duplicate';
  private readonly EXPORT_PATH = '/export';
  private readonly LIST_PATH = '/list';
  private readonly OPERATORS_PATH = '/operators';
  private readonly RUN_PATH = '/run';
  private readonly GET_WORKFLOW_PATH = '/getWorkflows';
  private readonly GET_CRITERIA_PATH = '/getCriteria';
  private readonly GET_COLUMNS_PATH = '/getColumns';
  private readonly FINISH_EXPORT_PATH = '/finishExport/';
  private readonly GET_LIST_OPTIONS_FOR_ENTITY = '/getListByVariable';

  constructor(@Inject(ENV) private env: Env, private http: HttpClient, private router: Router) {}
  public getWorkflowList(): Observable<WorkflowCreateCardDTO[]> {
    return this.http
      .get<WorkflowCreateCardDTO[]>(`${this.env.apiBaseUrl}${this.GET_ADV_SEARCH_PATH}${this.GET_WORKFLOW_PATH}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
  public getAdvSearchById(id: number): Observable<AdvSearchDTO> {
    return this.http
      .get<AdvSearchDTO>(`${this.env.apiBaseUrl}${this.GET_ADV_SEARCH_PATH}/${id}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
  public createAdvSearch(search: AdvSearchDTO): Observable<AdvSearchDTO> {
    return this.http
      .post<AdvSearchDTO>(`${this.env.apiBaseUrl}${this.GET_ADV_SEARCH_PATH}`, search)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
  public deleteAdvSearchById(id: number): Observable<AdvSearchDTO> {
    return this.http
      .delete<AdvSearchDTO>(`${this.env.apiBaseUrl}${this.GET_ADV_SEARCH_PATH}/${id}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
  public duplicateAdvSearch(id: number): Observable<AdvSearchDTO> {
    return this.http
      .get<AdvSearchDTO>(`${this.env.apiBaseUrl}${this.GET_ADV_SEARCH_PATH}${this.DUPLICATE_PATH}/${id}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
  public exportAdvSearch(search: AdvSearchDTO): Observable<FileAsyncDTO> {
    return this.http
      .post<FileAsyncDTO>(`${this.env.apiBaseUrl}${this.GET_ADV_SEARCH_PATH}${this.EXPORT_PATH}`, search)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
  public finishExportAdvSearch(idFile: number): Observable<AttachmentDTO> {
    return this.http
      .get<AttachmentDTO>(`${this.env.apiBaseUrl}${this.GET_ADV_SEARCH_PATH}${this.FINISH_EXPORT_PATH}${idFile}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
  public getAdvSearchList(): Observable<AdvSearchDTO[]> {
    return this.http
      .get<AdvSearchDTO[]>(`${this.env.apiBaseUrl}${this.GET_ADV_SEARCH_PATH}${this.LIST_PATH}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
  public getOptionsListForEntity(idVariable: number): Observable<{ id: number; value: string }[]> {
    return this.http
      .get<{ id: number; value: string }[]>(
        `${this.env.apiBaseUrl}${this.GET_ADV_SEARCH_PATH}${this.GET_LIST_OPTIONS_FOR_ENTITY}/${idVariable}`
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
  public getAdvSearchOperators(dataType?: string): Observable<AdvSearchOperatorDTO[]> {
    let url = `${this.env.apiBaseUrl}${this.GET_ADV_SEARCH_PATH}${this.OPERATORS_PATH}`;
    if (dataType) {
      url += `/${dataType}`;
    }
    return this.http.get<AdvSearchOperatorDTO[]>(url).pipe(catchError((error) => throwError(error as ConcenetError)));
  }
  public executeSearch(search: AdvSearchDTO, pagination?: PaginationRequestI): Observable<PaginationResponseI<any[]>> {
    return this.http
      .post<PaginationResponseI<any[]>>(
        `${this.env.apiBaseUrl}${this.GET_ADV_SEARCH_PATH}${this.RUN_PATH}${getPaginationUrlGetParams(pagination, true)}`,
        search
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
  public getCriteria(): Observable<AdvancedSearchOptionsDTO> {
    return this.http
      .get<AdvancedSearchOptionsDTO>(`${this.env.apiBaseUrl}${this.GET_ADV_SEARCH_PATH}${this.GET_CRITERIA_PATH}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
  public getColumns(): Observable<AdvancedSearchOptionsDTO> {
    return this.http
      .get<AdvancedSearchOptionsDTO>(`${this.env.apiBaseUrl}${this.GET_ADV_SEARCH_PATH}${this.GET_COLUMNS_PATH}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
}
