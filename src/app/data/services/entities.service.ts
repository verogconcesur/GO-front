import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENV } from '@app/constants/global.constants';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
import BasicFilterDTO from '@data/models/basic-filter-dto';
import CustomerEntityDTO from '@data/models/entities/customer-entity-dto';
import UserEntityDTO from '@data/models/entities/user-entity-dto';
import VehicleEntityDTO from '@data/models/entities/vehicle-entity-dto';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EntitiesService {
  private readonly GET_VEHICLES_PATH = '/api/vehicles/';
  private readonly GET_CUSTOMERS_PATH = '/api/customers/';
  private readonly GET_USERS_PATH = '/api/users/listByFilter';
  private readonly SEARCH_PATH = 'search';

  constructor(@Inject(ENV) private env: Env, private http: HttpClient) {}

  /**
   * Search vehicles
   *
   * @returns VehicleEntityDTO[]
   */
  public searchVehicles(search: BasicFilterDTO): Observable<VehicleEntityDTO[]> {
    return this.http
      .post<VehicleEntityDTO[]>(`${this.env.apiBaseUrl}${this.GET_VEHICLES_PATH}${this.SEARCH_PATH}`, search)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
  /**
   * Search users
   *
   * @returns UserEntityDTO[]
   */
  public searchUsers(search: BasicFilterDTO): Observable<UserEntityDTO[]> {
    return this.http
      .post<UserEntityDTO[]>(`${this.env.apiBaseUrl}${this.GET_USERS_PATH}`, search)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
  /**
   * Search customers
   *
   * @returns CustomerEntityDTO[]
   */
  public searchCustomers(search: BasicFilterDTO): Observable<CustomerEntityDTO[]> {
    return this.http
      .post<CustomerEntityDTO[]>(`${this.env.apiBaseUrl}${this.GET_CUSTOMERS_PATH}${this.SEARCH_PATH}`, search)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Find customer
   *
   * @returns CustomerEntityDTO
   */
  public getCustomer(idCustomer: number): Observable<CustomerEntityDTO> {
    return this.http
      .get<CustomerEntityDTO>(`${this.env.apiBaseUrl}${this.GET_CUSTOMERS_PATH}${idCustomer}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Create customer
   *
   * @returns CustomerEntityDTO
   */
  public createCustomer(customer: CustomerEntityDTO): Observable<CustomerEntityDTO> {
    return this.http
      .post<CustomerEntityDTO>(`${this.env.apiBaseUrl}${this.GET_CUSTOMERS_PATH}`, customer)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Find Vehicle
   *
   * @returns VehicleEntityDTO
   */
  public getVehicle(idVehicle: number): Observable<VehicleEntityDTO> {
    return this.http
      .get<VehicleEntityDTO>(`${this.env.apiBaseUrl}${this.GET_VEHICLES_PATH}${idVehicle}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Create Vehicle
   *
   * @returns VehicleEntityDTO
   */
  public createVehicle(vehicle: VehicleEntityDTO): Observable<VehicleEntityDTO> {
    return this.http
      .post<VehicleEntityDTO>(`${this.env.apiBaseUrl}${this.GET_VEHICLES_PATH}`, vehicle)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
}
