import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { ENV } from '@app/constants/global.constants';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
import DepartmentsGroupedByFacility from '@data/interfaces/departments-grouped-by-facility';
import BrandDTO from '@data/models/brand-dto';
import DepartmentDTO from '@data/models/department-dto';
import FacilityDTO from '@data/models/facility-dto';
import { forkJoin, Observable, of, throwError } from 'rxjs';
import { catchError, map, reduce } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private departmentsByFacilities: any = {};
  private readonly GET_DEPARMENT_PATH = '/api/departments/';
  private readonly GET_DEPARMENTS_PATH = '/api/departments/findAllByFacilities/';
  private readonly DUPLICATE_DEPARTMENT_PATH = '/api/departments/duplicate';
  private readonly DELETE_DEPARTMENT_PATH = '/api/departments';

  constructor(@Inject(ENV) private env: Env, private http: HttpClient, private router: Router) {}

  public resetDepartmentsData(): void {
    this.departmentsByFacilities = {};
  }

  //Used to resolove :id route, if we have the data in the routerState we don't ask for it
  public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<DepartmentDTO> {
    const navigation = this.router.getCurrentNavigation();
    const routerState = navigation.extras.state as { department: DepartmentDTO };
    if (routerState?.department?.id) {
      return of(routerState.department);
    } else {
      const id = route.params.idDepartment;
      return this.http
        .get<DepartmentDTO>(`${this.env.apiBaseUrl}${this.GET_DEPARMENT_PATH}${id}`)
        .pipe(catchError((error) => throwError(error as ConcenetError)));
    }
  }

  public getDepartmentOptionsListByFacilities(facilities: FacilityDTO[]): Observable<DepartmentsGroupedByFacility[]> {
    const ids = facilities.map((facility: FacilityDTO) => facility.id);
    const departmentsByFacilitiesInMemory = Object.keys(this.departmentsByFacilities).map((id: string) => parseInt(id, 10));
    const facilitiesToSearch = facilities.filter(
      (facility: FacilityDTO) => departmentsByFacilitiesInMemory.indexOf(facility.id) === -1
    );
    if (facilitiesToSearch.length) {
      const requests: Observable<DepartmentDTO[]>[] = [];
      facilitiesToSearch.forEach((facility: FacilityDTO) => {
        requests.push(
          this.getDepartmentsByFacilitiesIds([facility.id]).pipe(
            map((departments: DepartmentDTO[]) => {
              departments?.map((department: DepartmentDTO) => {
                department.facilities = department.facilities ? department.facilities : [facility];
                return department;
              });
              this.departmentsByFacilities[facility.id.toString()] = departments ? departments : [];
              return departments;
            })
          )
        );
      });
      return forkJoin(requests).pipe(
        reduce((prev, curr) => [...prev, ...curr], []),
        map((departments) => this.getDepartmentsGroupedToReturn(ids))
      );
    } else {
      return of(this.getDepartmentsGroupedToReturn(ids));
    }
  }

  public addDepartment(item: DepartmentDTO): Observable<DepartmentDTO> {
    return this.http
      .post<DepartmentDTO>(`${this.env.apiBaseUrl}${this.GET_DEPARMENT_PATH}`, item)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  public deleteDepartment(id: number): Observable<DepartmentDTO> {
    return this.http
      .delete<DepartmentDTO>(`${this.env.apiBaseUrl}${this.DELETE_DEPARTMENT_PATH}/${id}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  public getDepartmentsByFacilitiesIds(ids: number[]): Observable<DepartmentDTO[]> {
    if (ids && ids.length > 0) {
      return this.http
        .get<DepartmentDTO[]>(`${this.env.apiBaseUrl}${this.GET_DEPARMENTS_PATH}${ids.join(',')}`)
        .pipe(catchError((error) => throwError(error as ConcenetError)));
    } else {
      return of([]);
    }
  }

  public getDepartmentsById(id: number): Observable<DepartmentDTO> {
    return this.http
      .get<DepartmentDTO>(`${this.env.apiBaseUrl}${this.GET_DEPARMENT_PATH}${id}`)
      .pipe(catchError((error) => throwError(error as ConcenetError)));
  }

  public duplicateDepartment(id: number): Observable<DepartmentDTO> {
    return this.http
      .get<DepartmentDTO>(`${this.env.apiBaseUrl}${this.DUPLICATE_DEPARTMENT_PATH}/${id}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  private getDepartmentsGroupedToReturn(facilityIdsToUse: number[]): DepartmentsGroupedByFacility[] {
    let list: DepartmentsGroupedByFacility[] = [];
    let departmentsForFacility: DepartmentDTO[] = [];
    facilityIdsToUse.forEach((id) => {
      departmentsForFacility = this.departmentsByFacilities[id.toString()];
      if (departmentsForFacility && departmentsForFacility.length) {
        list = [
          ...list,
          {
            facilityId: departmentsForFacility[0].facilities[0].id,
            facilityName: this.getDepartmentsGroupedName(departmentsForFacility),
            departments: departmentsForFacility
          }
        ];
      }
    });
    return list;
  }

  private getDepartmentsGroupedName(departmentsForFacility: DepartmentDTO[]): string {
    if (departmentsForFacility[0]?.facilities[0] && departmentsForFacility[0].facilities[0].brands[0]) {
      return departmentsForFacility[0].facilities[0].name + ' (' + departmentsForFacility[0].facilities[0].brands[0].name + ')';
    } else if (departmentsForFacility[0]?.facilities[0]?.name) {
      return departmentsForFacility[0].facilities[0].name;
    } else {
      return '';
    }
  }
}
