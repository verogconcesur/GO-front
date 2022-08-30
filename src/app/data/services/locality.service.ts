import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ENV } from '@app/constants/global.constants';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
import CountryDTO from '@data/models/location/country-dto';
import ProvinceDTO from '@data/models/location/province-dto';
import TownDTO from '@data/models/location/town-dto';
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

  public getCountries(): Observable<CountryDTO[]> {
    return this.http
      .get<CountryDTO[]>(`${this.env.apiBaseUrl}${this.GET_COUNTRY}`)
      .pipe(catchError((error) => throwError(error as ConcenetError)));
  }
  public getProvincesByCountryId(id: number): Observable<ProvinceDTO[]> {
    return this.http
      .get<ProvinceDTO[]>(`${this.env.apiBaseUrl}${this.GET_PROVINCE_BY_COUNTRY}${id}`)
      .pipe(catchError((error) => throwError(error as ConcenetError)));
  }
  public getTownsByProvinceId(id: number): Observable<TownDTO[]> {
    return this.http
      .get<TownDTO[]>(`${this.env.apiBaseUrl}${this.GET_TOWN_BY_PROVINCE}${id}`)
      .pipe(catchError((error) => throwError(error as ConcenetError)));
  }
}
