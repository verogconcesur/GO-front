import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENV } from '@app/constants/global.constants';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
import PaginationRequestI from '@data/interfaces/pagination-request';
import PaginationResponseI from '@data/interfaces/pagination-response';
import UserDetailsDTO from '@data/models/user-details-dto';
import UserDTO from '@data/models/user-dto';
import UserFilterDTO from '@data/models/user-filter-dto';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { getPaginationUrlGetParams } from './pagination-aux';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly RESTORE_PASSWORD_PATH = '/api/users/forgotPass';
  private readonly CHANGE_PASSWORD_PATH = '/api/users/forgotPassChange';
  private readonly USER_DETAILS_PATH = '/api/users';
  private readonly USER_EDIT_PROFILE_PATH = '/api/users/editProfile';
  private readonly SEARCH_USERS_PATH = '/api/users/search';

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

  public getUserDetailsById(userId: number): Observable<UserDetailsDTO> {
    return this.http
      .get<UserDetailsDTO>(`${this.env.apiBaseUrl}${this.USER_DETAILS_PATH}/${userId}`)
      .pipe(catchError((error) => throwError(error as ConcenetError)));
  }

  public editUserProfile(userData: {
    id: number;
    name: string;
    firstName: string;
    lastName: string;
    email: string;
    currentPass: string | null;
    newPass: string | null;
    newPassConfirmation: string | null;
  }): Observable<UserDetailsDTO> {
    return this.http
      .put<UserDetailsDTO>(`${this.env.apiBaseUrl}${this.USER_EDIT_PROFILE_PATH}`, userData)
      .pipe(catchError((error) => throwError(error as ConcenetError)));
  }

  public searchUsers(
    userFilter: UserFilterDTO,
    pagination?: PaginationRequestI
  ): Observable<PaginationResponseI<UserDetailsDTO>> {
    return this.http
      .post<PaginationResponseI<UserDetailsDTO>>(
        `${this.env.apiBaseUrl}${this.SEARCH_USERS_PATH}${getPaginationUrlGetParams(pagination, true)}`,
        userFilter
      )
      .pipe(catchError((error) => throwError(error as ConcenetError)));
  }
}
