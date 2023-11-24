import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { ENV } from '@app/constants/global.constants';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
import BrandDTO from '@data/models/organization/brand-dto';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BrandService {
  private readonly GET_BRANDS_PATH = '/api/brands';
  private readonly GET_ALL_BRANDS_LIST_PATH = '/api/brands/findAll/';
  private readonly GET_ALL_BRANDS_LIST_FULL_PATH = '/api/brands/findAllFull/';
  private readonly DUPLICATE_BRAND_PATH = '/api/brands/duplicate';
  private readonly DELETE_BRAND_PATH = '/api/brands';

  constructor(@Inject(ENV) private env: Env, private http: HttpClient, private router: Router) {}

  public getBrandById(id: number): Observable<BrandDTO> {
    return this.http
      .get<BrandDTO>(`${this.env.apiBaseUrl}${this.GET_BRANDS_PATH}/${id}`)
      .pipe(catchError((error) => throwError(error as ConcenetError)));
  }

  public getAllBrands(ids?: number[]): Observable<BrandDTO[]> {
    if (ids && ids.length > 0) {
      return this.http
        .get<BrandDTO[]>(`${this.env.apiBaseUrl}${this.GET_ALL_BRANDS_LIST_PATH}${ids.join(',')}`)
        .pipe(catchError((error) => throwError(error as ConcenetError)));
    } else {
      return this.http
        .get<BrandDTO[]>(`${this.env.apiBaseUrl}${this.GET_ALL_BRANDS_LIST_PATH}`)
        .pipe(catchError((error) => throwError(error as ConcenetError)));
    }
  }

  public getAllBrandsFull(ids?: number[]): Observable<BrandDTO[]> {
    if (ids && ids.length > 0) {
      return this.http
        .get<BrandDTO[]>(`${this.env.apiBaseUrl}${this.GET_ALL_BRANDS_LIST_FULL_PATH}${ids.join(',')}`)
        .pipe(catchError((error) => throwError(error as ConcenetError)));
    } else {
      return this.http
        .get<BrandDTO[]>(`${this.env.apiBaseUrl}${this.GET_ALL_BRANDS_LIST_FULL_PATH}`)
        .pipe(catchError((error) => throwError(error as ConcenetError)));
    }
  }

  //Used to resolove :id route, if we have the data in the routerState we don't ask for it
  public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<BrandDTO> {
    const navigation = this.router.getCurrentNavigation();
    const routerState = navigation.extras.state as { brand: BrandDTO };
    if (routerState?.brand?.id) {
      return of(routerState.brand);
    } else {
      const id = route.params.idBrand;
      return this.http
        .get<BrandDTO>(`${this.env.apiBaseUrl}${this.GET_BRANDS_PATH}/${id}`)
        .pipe(catchError((error) => throwError(error.error as ConcenetError)));
    }
  }

  public addBrand(brand: BrandDTO): Observable<BrandDTO> {
    return this.http
      .post<BrandDTO>(`${this.env.apiBaseUrl}${this.GET_BRANDS_PATH}`, brand)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  public duplicateBrand(id: number): Observable<BrandDTO> {
    return this.http
      .get<BrandDTO>(`${this.env.apiBaseUrl}${this.DUPLICATE_BRAND_PATH}/${id}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  public deleteBrand(id: number): Observable<BrandDTO> {
    return this.http
      .delete<BrandDTO>(`${this.env.apiBaseUrl}${this.DELETE_BRAND_PATH}/${id}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
}
