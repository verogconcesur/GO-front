import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DEFAULT_I18N_LANG, ENV } from '@app/constants/global.constants';
import { CoreModule } from '@app/core.module';
import { translateLoaderFactory } from '@app/locale/translate-loader.factory';
import { TokenInterceptor } from '@app/security/token.interceptor';
import { rxStompServiceFactory } from '@app/services/rx-stomp-service-factory';
import { RxStompService } from '@app/services/rx-stomp.service';
import { environment } from '@env';
import { LayoutModule } from '@layout/layout.module';
import { TranslateCompiler, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { TranslateMessageFormatCompiler } from 'ngx-translate-messageformat-compiler';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    LoggerModule.forRoot({
      enableSourceMaps: true,
      level: environment.logLevel || NgxLoggerLevel.ERROR
    }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: translateLoaderFactory,
        deps: [HttpClient]
      },
      compiler: {
        provide: TranslateCompiler,
        useClass: TranslateMessageFormatCompiler
      }
    }),
    AppRoutingModule,
    CoreModule,
    LayoutModule
  ],
  providers: [
    TranslateService,
    // * IMPORTANT: When you need to use environment variables,
    // * provide them like this! And use them with `@Inject(ENV)`.
    // * See `app.component.ts` for an example.
    { provide: ENV, useValue: environment },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
    // {
    //   provide: RxStompService,
    //   useFactory: rxStompServiceFactory
    // }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private translate: TranslateService) {
    this.setupAppLanguage();
  }

  private setupAppLanguage(): void {
    const lastLanguageSubstringIndex = 2;

    this.translate.setDefaultLang(DEFAULT_I18N_LANG);

    this.translate.use(navigator?.language?.substring(0, lastLanguageSubstringIndex));
  }
}
