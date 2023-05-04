import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { ENV } from '@app/constants/global.constants';
import { RxStompService } from '@app/services/rx-stomp.service';
import { Env } from '@app/types/env';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
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
    private rxStompService: RxStompService
  ) {}

  @HostListener('window:resize', ['$event']) onResize(event: { target: { innerHeight: number } }) {
    this.setVhProperty();
  }

  ngOnInit() {
    this.logger.debug('App.component#ngOnInit', this.env.apiBaseUrl);
    this.addBuildInfoMetatag();

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

    window.addEventListener('beforeunload', () => {
      this.rxStompService.deactivate();
      this.rxStompService.stompClient.forceDisconnect();
    });
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
}
