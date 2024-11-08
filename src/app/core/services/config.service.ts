import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { catchError, map, Observable, of } from 'rxjs';

export const configFactory =
  (config: ConfigService): (() => Observable<boolean>) =>
  () =>
    config.loadAppConfig();

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  constructor(private http: HttpClient) {}
  // retursn observable, right now just http.get
  loadAppConfig(): Observable<boolean> {
    return this.http.get('/config/config.json').pipe(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map((config: any) => {
        environment.apiBaseUrl = config.apiBaseUrl;
        environment.socketUrl = config.socketUrl;
        return true;
      }),
      catchError((error) => of(false))
    );
  }
}
