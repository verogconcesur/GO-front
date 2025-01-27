import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENV } from '@app/constants/global.constants';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BusinessTypes } from '../models/entities/customer-entity-dto';

@Injectable({
  providedIn: 'root'
})
export class CustomersService {
  readonly typePhoneComunications = [
    { value: 'UNKNOWN', name: 'Desconocido' },
    { value: 'PERSONALMOBILE', name: 'Móvil Personal' },
    { value: 'PERSONALLANDLINE', name: 'Línea Fija Personal' },
    { value: 'WORKMOBILE', name: 'Móvil de Trabajo' },
    { value: 'WORKLANDLINE', name: 'Línea Fija de Trabajo' }
  ];
  readonly genderTypes = [
    { value: 'UNKNOWN', name: 'Desconocido' },
    { value: 'MALE', name: 'Masculino' },
    { value: 'FEMALE', name: 'Femenino' },
    { value: 'OTHER', name: 'Otro' }
  ];
  private readonly GET_ALL_BUSNINESS = '/api/customers/findAllBusinessTypes/';

  constructor(@Inject(ENV) private env: Env, private http: HttpClient) {}
  public getAllBusinessTypes(facilityId: number): Observable<BusinessTypes[]> {
    return this.http
      .get<BusinessTypes[]>(`${this.env.apiBaseUrl}${this.GET_ALL_BUSNINESS}${facilityId}`)
      .pipe(catchError((error) => throwError(error as ConcenetError)));
  }
}
