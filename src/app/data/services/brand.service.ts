import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENV } from '@app/constants/global.constants';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
import BrandDTO from '@data/models/brand-dto';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BrandService {
  private readonly GET_BRANDS_PATH = '/api/brands';

  constructor(@Inject(ENV) private env: Env, private http: HttpClient) {}

  public getAllBrands(): Observable<BrandDTO[]> {
    return this.http
      .get<BrandDTO[]>(`${this.env.apiBaseUrl}${this.GET_BRANDS_PATH}`)
      .pipe(catchError((error) => throwError(error as ConcenetError)));
  }
}
