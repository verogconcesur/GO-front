import { HttpClient } from '@angular/common/http';
import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { ENV } from '@app/constants/global.constants';
import { PerformanceService } from '@app/services/performance.service';
import { RxStompService } from '@app/services/rx-stomp.service';
import { Env } from '@app/types/env';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public sampleTranslationStr: string = marker('sample.text');
  public count: number = this.getCount();

  constructor(
    @Inject(ENV) private env: Env,
    private meta: Meta,
    private logger: NGXLogger,
    private translate: TranslateService,
    private rxStompService: RxStompService,
    private performanceService: PerformanceService,
    private http: HttpClient
  ) {}

  @HostListener('window:resize', ['$event']) onResize(event: { target: { innerHeight: number } }) {
    this.setVhProperty();
  }

  ngOnInit() {
    console.log('entra');
    this.logger.debug('App.component#ngOnInit', this.env.apiBaseUrl);
    this.addBuildInfoMetatag();
    this.performanceService.initTimeoutToReload();

    // Sample translation using observable (just in case
    // language JSON is not loaded yet)
    this.translate.get(this.sampleTranslationStr, { count: this.count }).subscribe((txt) => {
      this.logger.debug('subscribed translation =>', txt);
    });

    // Sample instant translation. Be sure to call this
    // after the language JSON is loaded. If you call it like this,
    // (ngOnInit on the app.component) this instant() function could
    // be called BEFORE language .json file has been loaded (because
    // language files are ajax-loaded)
    this.logger.debug('instant translation =>', this.translate.instant(this.sampleTranslationStr, { count: this.count }));

    this.setVhProperty();

    if (this.env.socketsEnabled) {
      window.addEventListener('beforeunload', () => {
        this.rxStompService.deactivate();
        this.rxStompService.stompClient.forceDisconnect();
      });
    }
    const locale = window.navigator.language;
    moment.locale(locale);
    // if (this.isSessionStorageAvailable()) {
    //   const alreadyChecked = sessionStorage.getItem('version-check-initial');
    //   if (!alreadyChecked) {
    //     this.checkAppVersion();
    //     sessionStorage.setItem('version-check-initial', 'true');
    //   }
    //   setInterval(() => this.checkAppVersion(), 20 * 1000);
    // }
  }

  private setVhProperty(): void {
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    document.documentElement.style.setProperty('--vh', vh + 'px');
    document.documentElement.style.setProperty('--vw', vw + 'px');
  }

  private getCount(): number {
    const MAX_RANDOM_NUMBER = 3;

    return Math.floor(Math.random() * MAX_RANDOM_NUMBER);
  }

  private addBuildInfoMetatag(): void {
    this.logger.info('Adding build version info to <head>:', this.env.appVersion);

    this.meta.updateTag({
      name: 'version',
      content: `${this.env.appVersion}`
    });
  }
  private appVersion(): string {
    if (this.env.appVersion.includes('-')) {
      return this.env.appVersion.split('-')[0];
    }
    return this.env.appVersion;
  }
  private isSessionStorageAvailable(): boolean {
    try {
      const testKey = '__test__';
      sessionStorage.setItem(testKey, '1');
      sessionStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  // private checkAppVersion(): void {
  //   const url = `/assets/version.json?t=${new Date().getTime()}`;

  //   this.http.get<{ version: string }>(url).subscribe({
  //     next: (data) => {
  //       if (data.version !== this.appVersion()) {
  //         const baseUrl = window.location.href.split('#')[0];
  //         const hash = window.location.hash;
  //         window.location.href = `${baseUrl}?v=${new Date().getTime()}${hash}`;
  //       } else {
  //         console.log('Versiones coinciden, no se recarga.');
  //       }
  //     },
  //     error: (err) => {
  //       this.logger.error('No se pudo comprobar la versión.', err);
  //     }
  //   });
  // }
}
