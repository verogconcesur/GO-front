import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENV } from '@app/constants/global.constants';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
import LoginDTO from '@data/models/login-dto';
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
   * Stores the Logged user
   *
   * @param loginData
   */
  setLoggedUser(loginData: LoginDTO): void {
    sessionStorage.setItem(this.ACCESS_TOKEN, loginData.access_token);
    sessionStorage.setItem(this.EXPIRES_IN, loginData.expires_in.toString());
    sessionStorage.setItem(this.USER_ID, loginData.user.id.toString());
    sessionStorage.setItem(this.USER_FULL_NAME, loginData.user.firstName + loginData.user.lastName);
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
    clearInterval(this.tokenInterval);
  }
}
