import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENV } from '@app/constants/global.constants';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
import SpecialtiesGroupedByDepartment from '@data/interfaces/specialties-grouped-by-department';
import DepartmentDTO from '@data/models/department-dto';
import SpecialtyDTO from '@data/models/specialty-dto';
import { forkJoin, Observable, of, throwError } from 'rxjs';
import { catchError, map, reduce } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SpecialtyService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private specialtiesByDepartments: any = {};
  private readonly GET_SPECIALTY_PATH = '/api/specialties/';
  private readonly GET_SPECIALTIES_PATH = '/api/specialties/findAllByDepartments/';
  private readonly DELETE_SPECIALTY_PATH = '/api/specialties';
  private readonly DUPLICATE_SPECIALTYT_PATH = '/api/specialties/duplicate';

  constructor(@Inject(ENV) private env: Env, private http: HttpClient) {}

  public resetSpecialtiesData(): void {
    this.specialtiesByDepartments = {};
  }

  public getSpecialtyOptionsListByDepartments(departments: DepartmentDTO[]): Observable<SpecialtiesGroupedByDepartment[]> {
    const ids = departments.map((department: DepartmentDTO) => department.id);
    const specialtiesByDepartmentsInMemory = Object.keys(this.specialtiesByDepartments).map((id: string) => parseInt(id, 10));
    const departmentsToSearch = departments.filter((d: DepartmentDTO) => specialtiesByDepartmentsInMemory.indexOf(d.id) === -1);
    if (departmentsToSearch.length) {
      const requests: Observable<SpecialtyDTO[]>[] = [];
      departmentsToSearch.forEach((department: DepartmentDTO) => {
        requests.push(
          this.getSpecialtiesByDepartmentIds([department.id]).pipe(
            map((specialities: SpecialtyDTO[]) => {
              specialities?.map((specialty: SpecialtyDTO) => {
                specialty.departments = specialty.departments ? specialty.departments : [department];
                return specialty;
              });
              this.specialtiesByDepartments[department.id.toString()] = specialities ? specialities : [];
              return specialities;
            })
          )
        );
      });
      return forkJoin(requests).pipe(
        reduce((prev, curr) => [...prev, ...curr], []),
        map((specialities) => this.getSpecialtiesToReturn(ids))
      );
    } else {
      return of(this.getSpecialtiesToReturn(ids));
    }
  }

  public getSpecialtiesByDepartmentIds(ids: number[]): Observable<SpecialtyDTO[]> {
    if (ids && ids.length > 0) {
      return this.http
        .get<SpecialtyDTO[]>(`${this.env.apiBaseUrl}${this.GET_SPECIALTIES_PATH}${ids.join(',')}`)
        .pipe(catchError((error) => throwError(error as ConcenetError)));
    } else {
      return of([]);
    }
  }

  public getSpecialtiesById(id: number): Observable<SpecialtyDTO> {
    return this.http
      .get<SpecialtyDTO>(`${this.env.apiBaseUrl}${this.GET_SPECIALTY_PATH}${id}`)
      .pipe(catchError((error) => throwError(error as ConcenetError)));
  }

  public addSpecialty(item: SpecialtyDTO): Observable<SpecialtyDTO> {
    return this.http
      .post<SpecialtyDTO>(`${this.env.apiBaseUrl}${this.GET_SPECIALTY_PATH}`, item)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  public deleteSpecialty(id: number): Observable<SpecialtyDTO> {
    return this.http
      .delete<SpecialtyDTO>(`${this.env.apiBaseUrl}${this.DELETE_SPECIALTY_PATH}/${id}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  public duplicateSpecialty(id: number): Observable<SpecialtyDTO> {
    return this.http
      .get<SpecialtyDTO>(`${this.env.apiBaseUrl}${this.DUPLICATE_SPECIALTYT_PATH}/${id}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  private getSpecialtiesToReturn(departmentIdsToUse: number[]): SpecialtiesGroupedByDepartment[] {
    let list: SpecialtiesGroupedByDepartment[] = [];
    let specialtiesForDepartment: SpecialtyDTO[] = [];
    departmentIdsToUse.forEach((id) => {
      specialtiesForDepartment = this.specialtiesByDepartments[id.toString()];
      if (specialtiesForDepartment && specialtiesForDepartment.length) {
        list = [
          ...list,
          {
            departmentId: specialtiesForDepartment[0].departments[0].id,
            departmentName:
              specialtiesForDepartment[0].departments[0].name +
              ' - ' +
              specialtiesForDepartment[0].departments[0].facilities[0].name +
              ' (' +
              specialtiesForDepartment[0].departments[0].facilities[0].brands[0].name +
              ')',
            specialties: specialtiesForDepartment
          }
        ];
      }
    });
    return list;
  }
}
