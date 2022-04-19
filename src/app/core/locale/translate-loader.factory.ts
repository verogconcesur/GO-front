import { HttpClient } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export class TranslateHttpLoader implements TranslateLoader {
  constructor(private http: HttpClient, public prefix: string = '/assets/i18n/', public suffix: string = '.json') {}

  public getTranslation(lang: string): Observable<unknown> {
    return this.http.get(`${this.prefix}${lang}${this.suffix}`).pipe(catchError((error) => of()));
  }
}

export const translateLoaderFactory = (http: HttpClient) => new TranslateHttpLoader(http);
