import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENV } from '@app/constants/global.constants';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
import UserDTO from '@data/models/user-dto';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  public readonly RESTORE_PASSWORD_PATH = '/api/users/forgotPass';
  public readonly CHANGE_PASSWORD_PATH = '/api/users/forgotPassChange';

  constructor(@Inject(ENV) private env: Env, private http: HttpClient) {}

  public restorePassword(userName: string): Observable<void> {
    return this.http
      .get<void>(`${this.env.apiBaseUrl}${this.RESTORE_PASSWORD_PATH}/${userName}`)
      .pipe(catchError((error) => throwError(error as ConcenetError)));
  }

  public changePassword(credentials: {
    hash: string;
    userName: string;
    pass: string;
    passConfirmation: string;
  }): Observable<UserDTO> {
    return this.http
      .post<UserDTO>(`${this.env.apiBaseUrl}${this.CHANGE_PASSWORD_PATH}`, credentials)
      .pipe(catchError((error) => throwError(error as ConcenetError)));
  }
}
