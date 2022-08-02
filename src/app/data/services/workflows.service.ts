/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENV } from '@app/constants/global.constants';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
import WorkflowListByFacilityDto from '@data/models/workflow-list-by-facility-dto';
import { Observable, of, Subject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WorkflowsService {
  private readonly GET_WORKFLOWS_LIST_PATH = '/api/workflows/list';

  constructor(@Inject(ENV) private env: Env, private http: HttpClient) {}

  /**
   * Devuelve el listado de workflow que el usuario logado puede ver.
   *
   * @returns WorkflowListByFacilityDto[]
   */
  public getWorkflowsList(): Observable<WorkflowListByFacilityDto[]> {
    return this.http
      .get<WorkflowListByFacilityDto[]>(`${this.env.apiBaseUrl}${this.GET_WORKFLOWS_LIST_PATH}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
}
