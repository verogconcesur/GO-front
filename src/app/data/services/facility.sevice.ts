import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { ENV } from '@app/constants/global.constants';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
import FacilitiesGroupedByBrand from '@data/interfaces/facilities-grouped-by-brand';
import BrandDTO from '@data/models/brand-dto';
import FacilityDTO from '@data/models/facility-dto';
import { forkJoin, Observable, of, throwError } from 'rxjs';
import { catchError, map, reduce } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FacilityService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private facilitiesByBrand: any = {};
  private readonly GET_FACILITY = '/api/facilities/';
  private readonly GET_FACILITIES_PATH = '/api/facilities/findAllByBrands/';
  private readonly DELETE_FACILITY_PATH = '/api/facilities';
  private readonly DUPLICATE_FACILITY_PATH = '/api/facilities/duplicate';

  constructor(@Inject(ENV) private env: Env, private http: HttpClient, private router: Router) {}

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

  public getFacilitiesByBrandsIds(ids: number[]): Observable<FacilityDTO[]> {
    if (ids && ids.length > 0) {
      return this.http
        .get<FacilityDTO[]>(`${this.env.apiBaseUrl}${this.GET_FACILITIES_PATH}${ids.join(',')}`)
        .pipe(catchError((error) => throwError(error as ConcenetError)));
    } else {
      return of([]);
    }
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
    let facilitiesList: FacilitiesGroupedByBrand[] = [];
    let facilitiesForBrand: FacilityDTO[] = [];
    brandsIdsToUse.forEach((id) => {
      facilitiesForBrand = this.facilitiesByBrand[id.toString()];
      if (facilitiesForBrand && facilitiesForBrand.length) {
        facilitiesList = [
          ...facilitiesList,
          {
            brandId: facilitiesForBrand[0].brands[0].id,
            brandName: facilitiesForBrand[0].brands[0].name,
            facilities: facilitiesForBrand
          }
        ];
      }
    });
    return facilitiesList;
  }
}
