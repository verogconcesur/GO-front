import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENV } from '@app/constants/global.constants';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
import PermissionsDTO from '@data/models/permissions-dto';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {
  private readonly GET_PERMISSIONS_PATH = '/api/permissions';

  constructor(@Inject(ENV) private env: Env, private http: HttpClient) {}

  public getAllPermissions(): Observable<PermissionsDTO[]> {
    return this.http
      .get<PermissionsDTO[]>(`${this.env.apiBaseUrl}${this.GET_PERMISSIONS_PATH}`)
      .pipe(catchError((error) => throwError(error as ConcenetError)));
  }
}
