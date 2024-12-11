import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENV } from '@app/constants/global.constants';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
import PaginationRequestI from '@data/interfaces/pagination-request';
import PaginationResponseI from '@data/interfaces/pagination-response';
import UserDetailsDTO from '@data/models/user-permissions/user-details-dto';
import UserDTO from '@data/models/user-permissions/user-dto';
import UserFilterDTO, { UserFilterByIdsDTO } from '@data/models/user-permissions/user-filter-dto';
import { getPaginationUrlGetParams } from '@data/utils/pagination-aux';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  public userLogged$: BehaviorSubject<UserDetailsDTO> = new BehaviorSubject(null);
  private readonly RESTORE_PASSWORD_PATH = '/api/users/forgotPass';
  private readonly CHANGE_PASSWORD_PATH = '/api/users/forgotPassChange';
  private readonly USER_DETAILS_PATH = '/api/users';
  private readonly USER_EDIT_PROFILE_PATH = '/api/users/editProfile';
  private readonly SEARCH_USERS_PATH = '/api/users/search';
  private readonly USER_ADD_PATH = '/api/users';
  private readonly USER_DELETE_PATH = '/api/users';
  private readonly USER_SEND2FA_PATH = '/api/users/sendUser2FA';
  private readonly USER_UPDATEPASS_PATH = '/api/users/updatePassByUser';

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

  public getUserRoleId(): number {
    return this.userLogged$.value?.role?.id;
  }

  public addUser(userData: UserDetailsDTO): Observable<UserDetailsDTO> {
    return this.http
      .post<UserDetailsDTO>(`${this.env.apiBaseUrl}${this.USER_ADD_PATH}`, userData)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
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
    signature: string;
    signatureContentType: string;
  }): Observable<UserDetailsDTO> {
    return this.http
      .put<UserDetailsDTO>(`${this.env.apiBaseUrl}${this.USER_EDIT_PROFILE_PATH}`, userData)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  public searchUsers(
    userFilter: UserFilterDTO | UserFilterByIdsDTO,
    pagination?: PaginationRequestI
  ): Observable<PaginationResponseI<UserDetailsDTO>> {
    return this.http
      .post<PaginationResponseI<UserDetailsDTO>>(
        `${this.env.apiBaseUrl}${this.SEARCH_USERS_PATH}${getPaginationUrlGetParams(pagination, true)}`,
        userFilter
      )
      .pipe(catchError((error) => throwError(error as ConcenetError)));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public deleteUser(userData: UserDetailsDTO): Observable<any> {
    return this.http
      .delete(`${this.env.apiBaseUrl}${this.USER_DELETE_PATH}/${userData.id}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  public sendUser2FA(userId: string): Observable<boolean> {
    return this.http
      .get<boolean>(`${this.env.apiBaseUrl}${this.USER_SEND2FA_PATH}/${userId}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  public updatePassByUser(credentials: {
    hash: string;
    userName: string;
    pass: string;
    passConfirmation: string;
  }): Observable<UserDTO> {
    return this.http
      .post<UserDTO>(`${this.env.apiBaseUrl}${this.USER_UPDATEPASS_PATH}`, credentials)
      .pipe(catchError((error) => throwError(error as ConcenetError)));
  }
}
