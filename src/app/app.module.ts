import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DEFAULT_I18N_LANG, ENV } from '@app/constants/global.constants';
import { CoreModule } from '@app/core.module';
import { translateLoaderFactory } from '@app/locale/translate-loader.factory';
import { Configuration } from '@data/api';
import { ApiModule } from '@data/api/api.module';
import { environment } from '@env';
import { LayoutModule } from '@layout/layout.module';
import { TranslateCompiler, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { TranslateMessageFormatCompiler } from 'ngx-translate-messageformat-compiler';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import mockServer from './app.mock';

if (environment.apiBaseUrl?.length <= 0) {
  mockServer();
}

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
    ApiModule.forRoot(
      () =>
        new Configuration({
          basePath: environment.apiBaseUrl
        })
    ),
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
    { provide: ENV, useValue: environment }
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
