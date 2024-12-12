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
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ENV } from '@app/constants/global.constants';
import { RouteConstants } from '@app/constants/route.constants';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
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
  private static readonly CACHE = 'Cache-Control';
  private static readonly OFFSET = 'Offset';

  private readonly BYPASS_URLS: string[] = ['/assets/', 'accounts.logout', 'checkUser2FA'];

  constructor(
    @Inject(ENV) private env: Env,
    private router: Router,
    private authenticationService: AuthenticationService,
    private translateService: TranslateService,
    private globalMessage: GlobalMessageService,
    private dialog: MatDialog
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
        [TokenInterceptor.AUTHORIZATION]: `Bearer ${access_token}`,
        [TokenInterceptor.CACHE]: 'no-cache'
        // [TokenInterceptor.OFFSET]: new Date().getTimezoneOffset().toString()
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
        this.dialog.closeAll();
        return this.logout(error.error);
      case 403:
        this.dialog.closeAll();
        return this.handle403Error(error.error);
      default:
        return throwError(error);
    }
  }

  private handle403Error(error: ConcenetError): ObservableResponse {
    const currentUrl = this.router.url;
    if (currentUrl !== `/${RouteConstants.LOGIN}`) {
      console.log('entra');
      this.router.navigate([RouteConstants.DASHBOARD]);
      this.globalMessage.showError({
        message: this.translateService.instant(marker('common.accessDenied')),
        actionText: this.translateService.instant(marker('common.close'))
      });
    }
    return throwError(error);
  }
}
