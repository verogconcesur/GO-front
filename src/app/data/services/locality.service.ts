import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ENV } from '@app/constants/global.constants';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
import CountryDto from '@data/models/country-dto';
import ProvinceDto from '@data/models/province-dto';
import TownDto from '@data/models/town-dto';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class LocalityService {
  private readonly GET_COUNTRY = '/api/countries/';
  private readonly GET_PROVINCE_BY_COUNTRY = '/api/provinces/findAllByCountry/';
  private readonly GET_TOWN_BY_PROVINCE = '/api/towns/findAllByProvince/';

  constructor(@Inject(ENV) private env: Env, private http: HttpClient, private router: Router) {}

  public getCountries(): Observable<CountryDto[]> {
    return this.http
      .get<CountryDto[]>(`${this.env.apiBaseUrl}${this.GET_COUNTRY}`)
      .pipe(catchError((error) => throwError(error as ConcenetError)));
  }
  public getProvincesByCountryId(id: number): Observable<ProvinceDto[]> {
    return this.http
      .get<ProvinceDto[]>(`${this.env.apiBaseUrl}${this.GET_PROVINCE_BY_COUNTRY}${id}`)
      .pipe(catchError((error) => throwError(error as ConcenetError)));
  }
  public getTownsByProvinceId(id: number): Observable<TownDto[]> {
    return this.http
      .get<TownDto[]>(`${this.env.apiBaseUrl}${this.GET_TOWN_BY_PROVINCE}${id}`)
      .pipe(catchError((error) => throwError(error as ConcenetError)));
  }
}
