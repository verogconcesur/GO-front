import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENV } from '@app/constants/global.constants';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
import RoleDTO from '@data/models/role-dto';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private readonly GET_ROLES_PATH = '/api/roles';
  private readonly DELETE_ROLE_PATH = '/api/roles';

  constructor(@Inject(ENV) private env: Env, private http: HttpClient) {}

  public getAllRoles(): Observable<RoleDTO[]> {
    return this.http
      .get<RoleDTO[]>(`${this.env.apiBaseUrl}${this.GET_ROLES_PATH}`)
      .pipe(catchError((error) => throwError(error as ConcenetError)));
  }

  public deleteRoleById(roleId: number): Observable<void[]> {
    return this.http
      .delete<void[]>(`${this.env.apiBaseUrl}${this.DELETE_ROLE_PATH}/${roleId}`)
      .pipe(catchError((error) => throwError(error as ConcenetError)));
  }
}
