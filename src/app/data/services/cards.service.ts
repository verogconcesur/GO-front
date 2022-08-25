/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENV } from '@app/constants/global.constants';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
import CardDto from '@data/models/cards/card-dto';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CardService {
  private readonly GET_CARD_PATH = '/api/cards';

  constructor(@Inject(ENV) private env: Env, private http: HttpClient) {}

  /**
   * Get card by id
   *
   * @returns WorkflowListByFacilityDto[]
   */
  public getCardById(id: number): Observable<CardDto> {
    return this.http
      .get<CardDto>(`${this.env.apiBaseUrl}${this.GET_CARD_PATH}/${id}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
}
