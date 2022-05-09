import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENV } from '@app/constants/global.constants';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
import LoginDTO from '@data/models/login-dto';
import RoleDTO from '@data/models/role-dto';
import PermissionsDTO from '@data/models/permissions-dto';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  public readonly LOGIN_PATH = '/api/users/login';
  public readonly REFRESH_TOKEN_PATH = '/api/users/refreshToken';

  private readonly ACCESS_TOKEN = 'access_token';
  private readonly EXPIRES_IN = 'expires_in';
  private readonly USER_ID = 'user_id';
  private readonly USER_FULL_NAME = 'user_full_name';
  private readonly USER_ROLE = 'user_role';
  private readonly USER_PERMISSIONS = 'user_permissions';

  private tokenInterval: NodeJS.Timer = null;

  constructor(@Inject(ENV) private env: Env, @Inject(DOCUMENT) private document: Document, private http: HttpClient) {}

  public signIn(credentials: { userName: string; password: string }): Observable<LoginDTO> {
    return this.http
      .post<LoginDTO>(`${this.env.apiBaseUrl}${this.LOGIN_PATH}`, credentials)
      .pipe(catchError((error) => throwError(error as ConcenetError)));
  }

  public keepTokenAlive(token: string, expires_in: number): void {
    const refreshTime = 3000;

    clearInterval(this.tokenInterval);

    if (token && expires_in) {
      this.tokenInterval = setInterval(() => {
        this.refreshToken().subscribe({
          next: (loginData) => {
            this.setLoggedUser(loginData);
          },
          error: (error: ConcenetError) => {
            console.log(error.message);
          }
        });
      }, expires_in - refreshTime);
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
    sessionStorage.setItem(this.ACCESS_TOKEN, token);
  }

  /**
   * Retrieves the saved token
   *
   * @returns saved token
   */
  getToken(): string {
    return sessionStorage.getItem(this.ACCESS_TOKEN);
  }

  /**
   * Remove the saved token
   */
  removeToken(): void {
    sessionStorage.removeItem(this.ACCESS_TOKEN);
  }

  /**
   * Stores the token expires_in
   *
   * @param time token expires_in
   */
  setExpiresIn(time: string) {
    sessionStorage.setItem(this.EXPIRES_IN, time);
  }

  /**
   * Retrieves the token expires_in
   *
   * @returns the token expires_in
   */
  getExpiresIn() {
    return sessionStorage.getItem(this.EXPIRES_IN);
  }

  /**
   * Remove the saved expires_in
   */
  removeExpiresIn() {
    sessionStorage.removeItem(this.EXPIRES_IN);
  }

  /**
   * Retrieves the userId
   *
   * @returns the userId
   */
  getUserId() {
    return sessionStorage.getItem(this.USER_ID);
  }

  /**
   * Remove the userId
   */
  removeUserId() {
    sessionStorage.removeItem(this.USER_ID);
  }

  /**
   * Retrieves the user full name
   *
   * @returns the userFullName
   */
  getUserFullName() {
    return sessionStorage.getItem(this.USER_FULL_NAME);
  }

  /**
   * Remove the userFullName
   */
  removeUserFullName() {
    sessionStorage.removeItem(this.USER_FULL_NAME);
  }

  /**
   * Retrieves the user role
   *
   * @returns the userRole
   */
  getUserRole(): RoleDTO{
    return JSON.parse(sessionStorage.getItem(this.USER_ROLE));
  }

  /**
   * Remove the userRole
   */
   removeUserRole() {
    sessionStorage.removeItem(this.USER_ROLE);
  }

  /**
   * Retrieves the user permissions
   *
   * @returns an array with user permissions
   */
  getUserPermissions(): PermissionsDTO[] {
    return JSON.parse(sessionStorage.getItem(this.USER_PERMISSIONS));
  }

  /**
   * Remove the userRole
   */
   removeUserPermissions() {
    sessionStorage.removeItem(this.USER_PERMISSIONS);
  }

  /**
   * Check if user has at least one of the permission passed by parameter
   *
   * @returns boolean
   */
   hasUserAnyPermission(permissions: string[]){
    const userPermissions = this.getUserPermissions().map(permission => permission.code);
    return permissions.reduce((prevValue, currentValue) => {
      if(!prevValue){
        return userPermissions.indexOf(currentValue) >= 0;
      }
      return prevValue;
    }, false);
  }

  /**
   * Stores the Logged user
   *
   * @param loginData
   */
  setLoggedUser(loginData: LoginDTO): void {
    sessionStorage.setItem(this.ACCESS_TOKEN, loginData.access_token);
    sessionStorage.setItem(this.EXPIRES_IN, loginData.expires_in.toString());
    sessionStorage.setItem(this.USER_ID, loginData.user.id.toString());
    sessionStorage.setItem(this.USER_FULL_NAME, loginData.user.firstName + loginData.user.lastName);
    sessionStorage.setItem(this.USER_ROLE, JSON.stringify(loginData.user.role));
    sessionStorage.setItem(this.USER_PERMISSIONS, JSON.stringify(loginData.user.permissions));
  }

  /**
   * Retrieves current logged user access_token / expires_in / user_id / user_full_name
   */
  getLoggedUser(): {
    access_token: string;
    expires_in: string;
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
    clearInterval(this.tokenInterval);
  }
}
