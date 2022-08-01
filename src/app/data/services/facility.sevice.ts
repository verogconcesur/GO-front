import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { ENV } from '@app/constants/global.constants';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import FacilitiesGroupedByBrand from '@data/interfaces/facilities-grouped-by-brand';
import BrandDTO from '@data/models/brand-dto';
import FacilityDTO from '@data/models/facility-dto';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin, Observable, of, throwError } from 'rxjs';
import { catchError, map, reduce } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FacilityService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private facilitiesByBrand: any = {};
  private readonly GET_FACILITY = '/api/facilities/';
  private readonly GET_FACILITIES_PATH = '/api/facilities/findAll/';
  private readonly DELETE_FACILITY_PATH = '/api/facilities';
  private readonly DUPLICATE_FACILITY_PATH = '/api/facilities/duplicate';

  constructor(
    @Inject(ENV) private env: Env,
    private http: HttpClient,
    private router: Router,
    private translateService: TranslateService
  ) {}

  public resetFacilitiesData(): void {
    this.facilitiesByBrand = {};
  }

  //Used to resolove :id route, if we have the data in the routerState we don't ask for it
  public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<FacilityDTO> {
    const navigation = this.router.getCurrentNavigation();
    const routerState = navigation.extras.state as { facility: FacilityDTO };
    if (routerState?.facility?.id) {
      return of(routerState.facility);
    } else {
      const id = route.params.idFacility;
      return this.http
        .get<FacilityDTO>(`${this.env.apiBaseUrl}${this.GET_FACILITY}${id}`)
        .pipe(catchError((error) => throwError(error as ConcenetError)));
    }
  }

  public getFacilitiesOptionsListByBrands(brands: BrandDTO[]): Observable<FacilitiesGroupedByBrand[]> {
    const ids = brands.map((brand: BrandDTO) => brand.id);
    const facilitiesByBrandsInMemory = Object.keys(this.facilitiesByBrand).map((id: string) => parseInt(id, 10));
    const brandsToSearch = brands.filter((brand: BrandDTO) => facilitiesByBrandsInMemory.indexOf(brand.id) === -1);
    if (brandsToSearch.length) {
      const requests: Observable<FacilityDTO[]>[] = [];
      brandsToSearch.forEach((brand: BrandDTO) => {
        requests.push(
          this.getFacilitiesByBrandsIds([brand.id]).pipe(
            map((facilities: FacilityDTO[]) => {
              facilities?.map((facility: FacilityDTO) => {
                facility.brands = facility.brands ? facility.brands : [brand];
                return facility;
              });
              this.facilitiesByBrand[brand.id.toString()] = facilities ? facilities : [];
              return facilities;
            })
          )
        );
      });
      return forkJoin(requests).pipe(
        reduce((prev, curr) => [...prev, ...curr], []),
        map((facilities) => this.getFacilitiesGroupedToReturn(ids))
      );
    } else {
      return of(this.getFacilitiesGroupedToReturn(ids));
    }
  }

  public getFacilitiesByBrandsIds(ids?: number[]): Observable<FacilityDTO[]> {
    if (ids && ids.length > 0) {
      return this.http
        .get<FacilityDTO[]>(`${this.env.apiBaseUrl}${this.GET_FACILITIES_PATH}${ids.join(',')}`)
        .pipe(catchError((error) => throwError(error.error as ConcenetError)));
    } else {
      return this.http
        .get<FacilityDTO[]>(`${this.env.apiBaseUrl}${this.GET_FACILITIES_PATH}`)
        .pipe(catchError((error) => throwError(error.error as ConcenetError)));
    }
  }

  public getFacilitiesById(id: number): Observable<FacilityDTO> {
    return this.http
      .get<FacilityDTO>(`${this.env.apiBaseUrl}${this.GET_FACILITY}${id}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  public addFacility(facility: FacilityDTO): Observable<FacilityDTO> {
    return this.http
      .post<FacilityDTO>(`${this.env.apiBaseUrl}${this.GET_FACILITY}`, facility)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  public deleteFacility(id: number): Observable<FacilityDTO> {
    return this.http
      .delete<FacilityDTO>(`${this.env.apiBaseUrl}${this.DELETE_FACILITY_PATH}/${id}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  public duplicateFacility(id: number): Observable<FacilityDTO> {
    return this.http
      .get<FacilityDTO>(`${this.env.apiBaseUrl}${this.DUPLICATE_FACILITY_PATH}/${id}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  private getFacilitiesGroupedToReturn(brandsIdsToUse: number[]): FacilitiesGroupedByBrand[] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const brandsInserted: any[] = [];
    const facilitiesGroupedByBrand: FacilitiesGroupedByBrand[] = [];
    let facilitiesForBrand: FacilityDTO[] = [];
    brandsIdsToUse.forEach((id) => {
      facilitiesForBrand = this.facilitiesByBrand[id.toString()];
      if (facilitiesForBrand && facilitiesForBrand.length) {
        const uniqueBrand: FacilityDTO[] = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const multiBrand: any = {};
        facilitiesForBrand.forEach((facility) => {
          if (facility.brands?.length === 1) {
            uniqueBrand.push(facility);
          } else {
            const multiId = facility.brands.map((fac) => fac.id).join('#');
            multiBrand[multiId] = multiBrand[multiId] ? multiBrand[multiId] : [];
            multiBrand[multiId].push(facility);
          }
        });
        if (uniqueBrand.length > 0 && brandsInserted.indexOf(id) === -1) {
          brandsInserted.push(id);
          facilitiesGroupedByBrand.push({
            brandId: [id],
            brandName: uniqueBrand[0].brands[0].name,
            facilities: uniqueBrand
          });
        }
        if (Object.keys(multiBrand).length > 0) {
          Object.keys(multiBrand).forEach((k) => {
            if (brandsInserted.indexOf(k) === -1) {
              brandsInserted.push(k);
              facilitiesGroupedByBrand.push({
                brandId: [...multiBrand[k][0].brands.map((brand: BrandDTO) => brand.id)],
                brandName:
                  multiBrand[k][0].brands?.length > 1
                    ? this.translateService.instant(marker('organizations.brands.multiBrands'))
                    : multiBrand[k][0].brands[0].name,
                tooltipBrandName: multiBrand[k][0].brands.reduce(
                  (prev: string, curr: BrandDTO) => (prev ? (prev += `/${curr.name}`) : curr.name),
                  ''
                ),
                facilities: multiBrand[k]
              });
            }
          });
        }
      }
    });
    return facilitiesGroupedByBrand;
  }
}
