import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENV } from '@app/constants/global.constants';
import { Env } from '@app/types/env';
import PerformanceDTO from '@data/models/performance/performance-dto';
import { NGXLogger } from 'ngx-logger';
import { Observable, finalize, take } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PerformanceService {
  private readonly LOG_PATH = '/api/users/loggerPerformanceBrowserData';
  private reload = false;
  private readonly TIMEOUT_TIME = 10 * 60 * 1000; //10 min
  private timeout: NodeJS.Timeout = null;
  private performance: PerformanceDTO = null;

  constructor(@Inject(ENV) private env: Env, private http: HttpClient, private logger: NGXLogger) {}

  public refreshIfNecesary(): void {
    if (this.reload) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const prf: any = performance;
      this.performance = {
        jsHeapSizeLimit: prf?.memory?.jsHeapSizeLimit ? prf?.memory?.jsHeapSizeLimit : 0 / 1024 / 1024,
        totalJSHeapSize: prf?.memory?.totalJSHeapSize ? prf?.memory?.totalJSHeapSize : 0 / 1024 / 1024,
        usedJSHeapSize: prf?.memory?.usedJSHeapSize ? prf?.memory?.usedJSHeapSize : 0 / 1024 / 1024,
        sessionStorageSize: decodeURI(encodeURIComponent(JSON.stringify(sessionStorage))).length / 1024 / 1024,
        localStorageSize: decodeURI(encodeURIComponent(JSON.stringify(localStorage))).length / 1024 / 1024
      };
      if (!this.env.production) {
        console.log('- PERFORMANCE =>', this.performance);
      }
      this.sendLog()
        .pipe(
          take(1),
          finalize(() => {
            this.reload = false;
            this.destroy();
            this.initTimeoutToReload();
            // window.location.reload();
          })
        )
        .subscribe({
          next: (data) => console.log(data),
          error: (err) => console.error(err)
        });
    }
  }

  public initTimeoutToReload(): void {
    this.timeout = setTimeout(() => {
      this.reload = true;
    }, this.TIMEOUT_TIME);
  }

  public destroy(): void {
    clearTimeout(this.timeout);
  }

  private sendLog(): Observable<boolean> {
    return this.http.post<boolean>(`${this.env.apiBaseUrl}${this.LOG_PATH}`, this.performance);
  }
}
