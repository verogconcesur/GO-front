import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, OnDestroy } from '@angular/core';
import { ENV } from '@app/constants/global.constants';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
import WarningDTO from '@data/models/notifications/warning-dto';
import LoginDTO from '@data/models/user-permissions/login-dto';
import PermissionsDTO from '@data/models/user-permissions/permissions-dto';
import RoleDTO from '@data/models/user-permissions/role-dto';
import { UserService } from '@data/services/user.service';
import moment from 'moment';
import { Observable, throwError } from 'rxjs';
import { catchError, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService implements OnDestroy {
  public readonly LOGIN_PATH = '/api/users/login';
  public readonly REFRESH_TOKEN_PATH = '/api/users/refreshToken';
  public readonly GET_F2A_PATH = '/api/users/sendPass2FA';
  private readonly USER_CHECK2FA_PATH = '/api/users/checkUser2FA';
  private readonly UPDATE_CONTACT = '/api/users/updateContact';
  private readonly ACCESS_TOKEN = 'access_token';
  private readonly EXPIRES_IN = 'expires_in';
  private readonly PROJECT_VERSION = 'project_version';
  private readonly REFRESH_EXPIRES = 'refresh_expire_token';
  private readonly TOKEN_TIMESTAMP = 'token_timestamp';
  private readonly USER_ID = 'user_id';
  private readonly USER_FULL_NAME = 'user_full_name';
  private readonly USER_ROLE = 'user_role';
  private readonly USER_PERMISSIONS = 'user_permissions';
  private readonly REQUIRE_2FA = 'require_2fa';
  private readonly DEFAULT_MODE_2FA = 'default_mode_2fa';

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

  public signIn(credentials: { userName: string; password: string; deviceSignature: string }): Observable<LoginDTO> {
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
        let timeToExpire = token_timestamp + expires_in - moment().valueOf() - refreshTimeBeforeTokenExpires;
        timeToExpire = timeToExpire > 0 ? timeToExpire : 0;
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
        }, timeToExpire);
      }
    }
  }

  sendEmailAndPhone(smsAndEmail: { userId: number; email: string; phoneNumber: string }) {
    return this.http
      .post(`${this.env.apiBaseUrl}${this.UPDATE_CONTACT}`, smsAndEmail)
      .pipe(catchError((error) => throwError(error as ConcenetError)));
  }

  public refreshToken(): Observable<LoginDTO> {
    return this.http
      .get<LoginDTO>(`${this.env.apiBaseUrl}${this.REFRESH_TOKEN_PATH}`)
      .pipe(catchError((error) => throwError(error as ConcenetError)));
  }

  public sendF2APass(userId: number, type: string) {
    return this.http
      .get(`${this.env.apiBaseUrl}${this.GET_F2A_PATH}/${userId}/${type}`)
      .pipe(catchError((error) => throwError(error as ConcenetError)));
  }

  public checkUser2FA(f2aInfo: {
    userId: number;
    code2FA: string;
    deviceSignature: string;
    trust: boolean;
  }): Observable<LoginDTO> {
    return this.http
      .post<LoginDTO>(`${this.env.apiBaseUrl}${this.USER_CHECK2FA_PATH}`, f2aInfo)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
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
   * Stores the token refresh_expire_token
   *
   * @param time token refresh_expire_token
   */
  setRefreshExpires(time: string) {
    localStorage.setItem(this.REFRESH_EXPIRES, time);
  }

  /**
   * Retrieves the token refresh_expire_token
   *
   * @returns the token refresh_expire_token
   */
  getRefreshExpires() {
    return parseInt(localStorage.getItem(this.REFRESH_EXPIRES), 10);
  }

  /**
   * Remove the saved refresh_expire_token
   */
  removeRefreshExpires() {
    localStorage.removeItem(this.REFRESH_EXPIRES);
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
   * Remove the saved project_version
   */
  removeProjectVersion() {
    localStorage.removeItem(this.PROJECT_VERSION);
  }

  /**
   * Retrieves the require2FA
   *
   * @returns the project version
   */
  getProjectVersion() {
    return localStorage.getItem(this.PROJECT_VERSION);
  }

  /**
   * Retrieves the require2FA
   *
   * @returns the require2FA
   */
  getRequire2FA() {
    return localStorage.getItem(this.REQUIRE_2FA);
  }
  /**
   * remove the require2FA
   */
  removeRequire2FA() {
    return localStorage.removeItem(this.REQUIRE_2FA);
  }

  /**
   * Retrieves the defaultMode2FA
   *
   * @returns the defaultMode2FA
   */
  getDefaultMode2FA() {
    return localStorage.getItem(this.DEFAULT_MODE_2FA);
  }
  /**
   * remove the defaultMode2FA
   */
  removeDefaultMode2FA() {
    return localStorage.removeItem(this.DEFAULT_MODE_2FA);
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
    localStorage.setItem(this.REQUIRE_2FA, JSON.stringify(loginData.require2FA));
    localStorage.setItem(this.DEFAULT_MODE_2FA, JSON.stringify(loginData.defaultMode2FA));
  }

  setTokenData(loginData: LoginDTO): void {
    if (this.tokenTimeout) {
      clearTimeout(this.tokenTimeout);
      this.tokenTimeout = null;
    }
    localStorage.setItem(this.ACCESS_TOKEN, loginData.access_token);
    localStorage.setItem(this.EXPIRES_IN, loginData.expires_in.toString());
    localStorage.setItem(this.REFRESH_EXPIRES, loginData.refresh_expire_token.toString());
    localStorage.setItem(this.TOKEN_TIMESTAMP, (+new Date()).toString());
    localStorage.setItem(this.PROJECT_VERSION, loginData.project_version);
    this.keepTokenAlive();
  }

  /**
   * Retrieves current logged user access_token / expires_in / user_id / user_full_name
   */
  getLoggedUser(): {
    access_token: string;
    expires_in: number;
    refresh_expire_token: number;
    user_id: string;
    user_full_name: string;
  } {
    return {
      [this.ACCESS_TOKEN]: this.getToken(),
      [this.EXPIRES_IN]: this.getExpiresIn(),
      [this.REFRESH_EXPIRES]: this.getRefreshExpires(),
      [this.USER_ID]: this.getUserId(),
      [this.USER_FULL_NAME]: this.getUserFullName()
    };
  }

  /**
   * Check if there is a logged in user
   */
  isUserLogged(): boolean {
    const timeExpiration = moment(this.getTokenTimestamp() + this.getRefreshExpires());
    return !!this.getToken() && !!this.getRefreshExpires() && timeExpiration.isAfter(moment(), 'second');
  }

  /**
   * Log the current user out by removing credentials and log out from the system
   */
  logout(): void {
    this.removeToken();
    this.removeProjectVersion();
    this.removeExpiresIn();
    this.removeUserId();
    this.removeUserFullName();
    this.removeUserRole();
    this.removeUserPermissions();
    this.removeWarningStatus();
    this.removeDefaultMode2FA();
    this.removeRequire2FA();
    this.userService.userLogged$.next(null);
    clearTimeout(this.tokenTimeout);
  }

  generateBrowserFingerprint(): string {
    // Obtener User Agent del navegador
    const userAgent = window.navigator.userAgent;
    // Obtener la zona horaria
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    // Obtener puntos tactiles de la pantalla
    const tactil = window.navigator.maxTouchPoints;
    // Obtener GPU (WebGL info)
    const gpuInfo = this.getWebGLInfo();
    // Combinar todo en una cadena y codificar en Base64
    const fingerprintData = `${userAgent}__${timezone}_${tactil}_${gpuInfo}`;
    console.log(fingerprintData);
    // Codificar en Base64 para que sea más compacto
    return btoa(fingerprintData);
  }

  getWebGLInfo(): string {
    // Crear un elemento 'canvas' que se utilizará para obtener el contexto WebGL
    const canvas = document.createElement('canvas');
    // Intentar obtener el contexto de WebGL de forma explícita.
    // 'getContext("webgl")' devuelve el contexto WebGL si está disponible.
    // Si no está disponible, 'getContext("experimental-webgl")'
    //intenta usar una versión experimental de WebGL en navegadores más antiguos.
    const gl =
      (canvas.getContext('webgl') as WebGLRenderingContext) || (canvas.getContext('experimental-webgl') as WebGLRenderingContext);
    // Si no se puede obtener el contexto WebGL, significa que el navegador no soporta WebGL.
    // En ese caso, se devuelve 'NaN' para indicar que no se puede obtener la información.
    if (!gl) {
      return 'NaN';
    }
    // Intentar obtener la extensión 'WEBGL_debug_renderer_info', que proporciona detalles más específicos sobre la GPU.
    // Esta extensión permite acceder al fabricante (vendor) y al modelo (renderer) de la tarjeta gráfica.
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    // Si la extensión no está disponible (algunos navegadores pueden bloquearla por privacidad o seguridad),
    // se devuelve 'NaN', indicando que no se puede obtener información de la GPU.
    if (!debugInfo) {
      return 'NaN';
    }
    // Obtener el nombre del fabricante de la GPU.
    // 'UNMASKED_VENDOR_WEBGL' es el parámetro que devuelve el
    //fabricante de la tarjeta gráfica (por ejemplo, "NVIDIA", "Intel", "AMD").
    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || 'NaN';
    // Obtener el nombre del modelo de la GPU.
    // 'UNMASKED_RENDERER_WEBGL' es el parámetro que devuelve el
    //modelo exacto de la tarjeta gráfica (por ejemplo, "GeForce GTX 1050").
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'NaN';
    // Devolver un identificador único basado en la combinación del fabricante y el modelo de la GPU.
    // Si no se pueden obtener estos valores, se devolverá 'NaN' como valor predeterminado.
    return `${vendor}_${renderer}`;
  }
}
