import {
  HttpErrorResponse,
  HttpHandler,
  HttpHeaderResponse,
  HttpInterceptor,
  HttpProgressEvent,
  HttpRequest,
  HttpResponse,
  HttpSentEvent,
  HttpUserEvent
} from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ENV } from '@app/constants/global.constants';
import { RouteConstants } from '@app/constants/route.constants';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthenticationService } from './authentication.service';

type ObservableResponse = Observable<
  HttpSentEvent | HttpHeaderResponse | HttpProgressEvent | HttpResponse<unknown> | HttpUserEvent<unknown>
>;

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private static readonly AUTHORIZATION = 'Authorization';

  private readonly BYPASS_URLS: string[] = ['/assets/', 'accounts.logout'];

  constructor(
    @Inject(ENV) private env: Env,
    private router: Router,
    private authenticationService: AuthenticationService,
    private globalMessage: GlobalMessageService
  ) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): ObservableResponse {
    if (this.bypassInterceptor(req)) {
      return next.handle(req);
    }

    const access_token = this.authenticationService.getToken();
    const expires_in = this.authenticationService.getExpiresIn();

    if (access_token && expires_in) {
      return next
        .handle(this.addTokenHeaders(req, access_token))
        .pipe(catchError((error): ObservableResponse => this.handleError(error)));
    } else {
      return next.handle(req).pipe(catchError((error): ObservableResponse => this.handleError(error)));
    }
  }

  private addTokenHeaders(req: HttpRequest<unknown>, access_token: string): HttpRequest<unknown> {
    return req.clone({
      setHeaders: {
        [TokenInterceptor.AUTHORIZATION]: `Bearer ${access_token}`
      }
    });
  }

  private bypassInterceptor(req: HttpRequest<unknown>): boolean {
    return this.BYPASS_URLS.some((url) => req.url.includes(url));
  }

  private logout(error: ConcenetError): ObservableResponse {
    this.authenticationService.logout();
    this.router.navigate([RouteConstants.LOGIN]);

    return throwError(error);
  }

  private handleError(error: HttpErrorResponse | unknown): ObservableResponse {
    if (!(error instanceof HttpErrorResponse)) {
      return throwError(error);
    }

    switch (error.status) {
      case 401:
        return this.logout(error.error);
      case 403:
        return this.handle403Error(error.error);
      default:
        return throwError(error);
    }
  }

  private handle403Error(error: ConcenetError): ObservableResponse {
    this.router.navigate([RouteConstants.DASHBOARD]);
    this.globalMessage.showError({
      message: error.message,
      actionText: 'Close'
    });
    return throwError(error);
  }
}
