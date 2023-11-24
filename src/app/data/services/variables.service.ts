import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENV } from '@app/constants/global.constants';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
import VariablesDTO from '@data/models/variables-dto';
import WorkflowCardSlotDTO from '@data/models/workflows/workflow-card-slot-dto';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class VariablesService {
  private readonly GET_VARIABLE_PATH = '/api/variables';
  constructor(@Inject(ENV) private env: Env, private http: HttpClient) {}

  public searchVariables(): Observable<VariablesDTO[]> {
    return this.http
      .get<VariablesDTO[]>(`${this.env.apiBaseUrl}${this.GET_VARIABLE_PATH}`)
      .pipe(catchError((error) => throwError(error as ConcenetError)));
  }
  public searchVariablesSlots(): Observable<WorkflowCardSlotDTO[]> {
    return this.http
      .get<WorkflowCardSlotDTO[]>(`${this.env.apiBaseUrl}${this.GET_VARIABLE_PATH}`)
      .pipe(catchError((error) => throwError(error as ConcenetError)));
  }
}
