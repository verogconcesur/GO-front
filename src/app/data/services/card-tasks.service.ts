/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENV } from '@app/constants/global.constants';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
import { CardTaskDTO } from '@data/models/cards/card-tasks-dto';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CardTasksService {
  private readonly GET_CARD_INSTANCE_PATH = '/api/cardInstanceWorkflow';
  private readonly DETAIL_PATH = '/detail';
  private readonly TASKS_PATH = '/tasks';

  constructor(@Inject(ENV) private env: Env, private http: HttpClient) {}

  public getCardTasks(cardInstanceWorkflowId: number, tabId?: number): Observable<CardTaskDTO> {
    // eslint-disable-next-line max-len
    let url = `${this.env.apiBaseUrl}${this.GET_CARD_INSTANCE_PATH}${this.DETAIL_PATH}/${cardInstanceWorkflowId}${this.TASKS_PATH}`;
    if (tabId) {
      url += `/${tabId}`;
    }
    return this.http.get<CardTaskDTO>(url).pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
}
