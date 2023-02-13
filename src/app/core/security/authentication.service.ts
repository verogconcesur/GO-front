import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, OnDestroy } from '@angular/core';
import { ENV } from '@app/constants/global.constants';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
import LoginDTO from '@data/models/user-permissions/login-dto';
import RoleDTO from '@data/models/user-permissions/role-dto';
import PermissionsDTO from '@data/models/user-permissions/permissions-dto';
import { Observable, throwError } from 'rxjs';
import { catchError, take } from 'rxjs/operators';
import { UserService } from '@data/services/user.service';
import WarningDTO from '@data/models/notifications/warning-dto';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService implements OnDestroy {
  public readonly LOGIN_PATH = '/api/users/login';
  public readonly REFRESH_TOKEN_PATH = '/api/users/refreshToken';

  private readonly ACCESS_TOKEN = 'access_token';
  private readonly EXPIRES_IN = 'expires_in';
  private readonly TOKEN_TIMESTAMP = 'token_timestamp';
  private readonly USER_ID = 'user_id';
  private readonly USER_FULL_NAME = 'user_full_name';
  private readonly USER_ROLE = 'user_role';
  private readonly USER_PERMISSIONS = 'user_permissions';

  private readonly WARNING_STATUS = 'warning_status';

  private tokenTimeout: NodeJS.Timer = null;

  constructor(
    @Inject(ENV) private env: Env,
    @Inject(DOCUMENT) private document: Document,
    private http: HttpClient,
    private userService: UserService
  ) {}

  ngOnDestroy(): void {
    if (this.tokenTimeout) {
      clearTimeout(this.tokenTimeout);
    }
  }

  public signIn(credentials: { userName: string; password: string }): Observable<LoginDTO> {
    return this.http
      .post<LoginDTO>(`${this.env.apiBaseUrl}${this.LOGIN_PATH}`, credentials)
      .pipe(catchError((error) => throwError(error as ConcenetError)));
  }

  public keepTokenAlive(): void {
    const refreshTimeBeforeTokenExpires = 10000;
    if (!this.tokenTimeout) {
      const token = this.getToken();
      const expires_in = this.getExpiresIn();
      // const expires_in = 60000;
      const token_timestamp = this.getTokenTimestamp();
      if (token && expires_in && token_timestamp) {
        const timeToExpire = token_timestamp + expires_in - refreshTimeBeforeTokenExpires;
        // console.log(timeToExpire, +new Date(), timeToExpire - +new Date());
        this.tokenTimeout = setTimeout(() => {
          this.refreshToken()
            .pipe(take(1))
            .subscribe({
              next: (loginData) => {
                this.setTokenData(loginData);
              },
              error: (error: ConcenetError) => {
                console.log(error.message);
              }
            });
        }, timeToExpire - +new Date());
      }
    }
  }

  public refreshToken(): Observable<LoginDTO> {
    return this.http
      .get<LoginDTO>(`${this.env.apiBaseUrl}${this.REFRESH_TOKEN_PATH}`)
      .pipe(catchError((error) => throwError(error as ConcenetError)));
  }

  /**
   * Stores a token
   *
   * @param token token to be stored
   */
  setToken(token: string): void {
    localStorage.setItem(this.ACCESS_TOKEN, token);
  }

  /**
   * Retrieves the saved token
   *
   * @returns saved token
   */
  getToken(): string {
    return localStorage.getItem(this.ACCESS_TOKEN);
  }

  /**
   * Remove the saved token
   */
  removeToken(): void {
    localStorage.removeItem(this.ACCESS_TOKEN);
  }

  /**
   * Stores the token expires_in
   *
   * @param time token expires_in
   */
  setExpiresIn(time: string) {
    localStorage.setItem(this.EXPIRES_IN, time);
  }

  /**
   * Retrieves the token expires_in
   *
   * @returns the token expires_in
   */
  getExpiresIn() {
    return parseInt(localStorage.getItem(this.EXPIRES_IN), 10);
  }

  /**
   * Remove the saved expires_in
   */
  removeExpiresIn() {
    localStorage.removeItem(this.EXPIRES_IN);
  }

  /**
   * Stores the token token_timestamp
   *
   * @param timestamp token token_timestamp
   */
  setTokenTimestamp(timestamp: number) {
    localStorage.setItem(this.TOKEN_TIMESTAMP, timestamp.toString());
  }

  /**
   * Retrieves the token token_timestamp
   *
   * @returns the token_timestamp
   */
  getTokenTimestamp() {
    return parseInt(localStorage.getItem(this.TOKEN_TIMESTAMP), 10);
  }

  /**
   * Remove the saved token_timestamp
   */
  removeTokenTimestamp() {
    localStorage.removeItem(this.TOKEN_TIMESTAMP);
  }

  /**
   * Retrieves the userId
   *
   * @returns the userId
   */
  getUserId() {
    return localStorage.getItem(this.USER_ID);
  }

  /**
   * Remove the userId
   */
  removeUserId() {
    localStorage.removeItem(this.USER_ID);
  }

  /**
   * Retrieves the user full name
   *
   * @returns the userFullName
   */
  getUserFullName() {
    return localStorage.getItem(this.USER_FULL_NAME);
  }

  /**
   * Remove the userFullName
   */
  removeUserFullName() {
    localStorage.removeItem(this.USER_FULL_NAME);
  }

  /**
   * Retrieves the user role
   *
   * @returns the userRole
   */
  getUserRole(): RoleDTO {
    return JSON.parse(localStorage.getItem(this.USER_ROLE));
  }

  /**
   * Remove the userRole
   */
  removeUserRole() {
    localStorage.removeItem(this.USER_ROLE);
  }

  /**
   * Retrieves the user permissions
   *
   * @returns an array with user permissions
   */
  getUserPermissions(): PermissionsDTO[] {
    const permissions = JSON.parse(localStorage.getItem(this.USER_PERMISSIONS));
    return permissions ? permissions : [];
  }

  /**
   * Remove the userRole
   */
  removeUserPermissions() {
    localStorage.removeItem(this.USER_PERMISSIONS);
  }

  /**
   * Check if user has at least one of the permission passed by parameter
   *
   * @returns boolean
   */
  hasUserAnyPermission(permissions: string[]): boolean {
    const userPermissions = this.getUserPermissions().map((permission) => permission.code);
    return permissions.reduce((prevValue, currentValue) => {
      if (!prevValue) {
        return userPermissions.indexOf(currentValue) >= 0;
      }
      return prevValue;
    }, false);
  }

  getWarningStatus(): WarningDTO {
    const warningStatus = JSON.parse(localStorage.getItem(this.WARNING_STATUS));
    return warningStatus
      ? warningStatus
      : {
          lastDateNoReadMention: null,
          lastDateNoReadNotification: null,
          lastDateRequest: null,
          existsNoReadMention: false,
          existsNoReadNotification: false,
          newNoReadMention: false,
          newNoReadNotification: false,
          frontLastHeaderMentionOpenedTime: null,
          frontLastHeaderNotificationOpenedTime: null
        };
  }

  setWarningStatus(ws: WarningDTO): void {
    localStorage.setItem(this.WARNING_STATUS, JSON.stringify(ws));
  }

  removeWarningStatus(): void {
    localStorage.removeItem(this.WARNING_STATUS);
  }

  /**
   * Stores the Logged user
   *
   * @param loginData
   */
  setLoggedUser(loginData: LoginDTO): void {
    this.setTokenData(loginData);
    localStorage.setItem(this.USER_ID, loginData.user.id.toString());
    localStorage.setItem(this.USER_FULL_NAME, loginData.user.fullName);
    localStorage.setItem(this.USER_ROLE, JSON.stringify(loginData.user.role));
    localStorage.setItem(this.USER_PERMISSIONS, JSON.stringify(loginData.user.permissions));
  }

  setTokenData(loginData: LoginDTO): void {
    if (this.tokenTimeout) {
      clearTimeout(this.tokenTimeout);
      this.tokenTimeout = null;
    }
    localStorage.setItem(this.ACCESS_TOKEN, loginData.access_token);
    localStorage.setItem(this.EXPIRES_IN, loginData.expires_in.toString());
    localStorage.setItem(this.TOKEN_TIMESTAMP, (+new Date()).toString());
    this.keepTokenAlive();
  }

  /**
   * Retrieves current logged user access_token / expires_in / user_id / user_full_name
   */
  getLoggedUser(): {
    access_token: string;
    expires_in: number;
    user_id: string;
    user_full_name: string;
  } {
    return {
      [this.ACCESS_TOKEN]: this.getToken(),
      [this.EXPIRES_IN]: this.getExpiresIn(),
      [this.USER_ID]: this.getUserId(),
      [this.USER_FULL_NAME]: this.getUserFullName()
    };
  }

  /**
   * Check if there is a logged in user
   */
  isUserLogged(): boolean {
    return !!this.getToken() && !!this.getExpiresIn();
  }

  /**
   * Log the current user out by removing credentials and log out from the system
   */
  logout(): void {
    this.removeToken();
    this.removeExpiresIn();
    this.removeUserId();
    this.removeUserFullName();
    this.removeUserRole();
    this.removeUserPermissions();
    this.removeWarningStatus();
    this.userService.userLogged$.next(null);
    clearTimeout(this.tokenTimeout);
  }
}
