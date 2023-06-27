import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ENV } from '@app/constants/global.constants';
import { Env } from '@app/types/env';
import { ConcenetError } from '@app/types/error';
import PaginationRequestI from '@data/interfaces/pagination-request';
import PaginationResponseI from '@data/interfaces/pagination-response';
import BasicFilterDTO from '@data/models/basic-filter-dto';
import CustomerEntityApiDTO from '@data/models/entities/customer-entity-api-dto';
import CustomerEntityDTO from '@data/models/entities/customer-entity-dto';
import CustomerFilterDTO from '@data/models/entities/customer-filter-dto';
import RepairOrderEntityApiDTO from '@data/models/entities/repair-order-entity-api-dto';
import RepairOrderEntityDTO from '@data/models/entities/repair-order-entity-dto';
import RepairOrderFilterDTO from '@data/models/entities/repair-order-filter-dto';
import UserEntityDTO from '@data/models/entities/user-entity-dto';
import VehicleBodyApiDTO from '@data/models/entities/vehicle-body-api-dto';
import VehicleEntityDTO from '@data/models/entities/vehicle-entity-dto';
import VehicleFilterDTO from '@data/models/entities/vehicle-filter-dto';
import { getPaginationUrlGetParams } from '@data/utils/pagination-aux';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EntitiesService {
  private readonly GET_VEHICLES_PATH = '/api/vehicles/';
  private readonly GET_CUSTOMERS_PATH = '/api/customers/';
  private readonly GET_REPAIR_ORDER_PATH = '/api/repairOrders/';
  private readonly GET_USERS_PATH = '/api/users/listByFilter';
  private readonly SEARCH_PATH = 'search';
  private readonly SEARCH__EXTERNAL_API_PATH = 'searchExternalApi';
  private readonly SAVE__EXTERNAL_API_PATH = 'saveExternalApi/';
  private readonly SEARCH_PATH_PAG = 'searchPaged';

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

  public searchVehiclesPag(
    search: BasicFilterDTO,
    pagination?: PaginationRequestI
  ): Observable<PaginationResponseI<VehicleEntityDTO>> {
    return this.http
      .post<PaginationResponseI<VehicleEntityDTO>>(
        `${this.env.apiBaseUrl}${this.GET_VEHICLES_PATH}${this.SEARCH_PATH_PAG}${getPaginationUrlGetParams(pagination, true)}`,
        search
      )
      .pipe(catchError((error) => throwError(error as ConcenetError)));
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

  public searchCustomerPag(
    search: BasicFilterDTO,
    pagination?: PaginationRequestI
  ): Observable<PaginationResponseI<CustomerEntityDTO>> {
    return this.http
      .post<PaginationResponseI<CustomerEntityDTO>>(
        `${this.env.apiBaseUrl}${this.GET_CUSTOMERS_PATH}${this.SEARCH_PATH_PAG}${getPaginationUrlGetParams(pagination, true)}`,
        search
      )
      .pipe(catchError((error) => throwError(error as ConcenetError)));
  }

  /**
   * Search Repair Orders
   *
   * @returns RepairOrderEntityDTO[]
   */
  public searchRepairOrders(search: BasicFilterDTO): Observable<RepairOrderEntityDTO[]> {
    return this.http
      .post<RepairOrderEntityDTO[]>(`${this.env.apiBaseUrl}${this.GET_REPAIR_ORDER_PATH}${this.SEARCH_PATH}`, search)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
  /**
   * Search vehicles Api
   *
   * @returns VehicleEntityApiDTO[]
   */
  public searchVehiclesApi(search: VehicleFilterDTO): Observable<VehicleEntityDTO[]> {
    return this.http
      .post<VehicleEntityDTO[]>(`${this.env.apiBaseUrl}${this.GET_VEHICLES_PATH}${this.SEARCH__EXTERNAL_API_PATH}`, search)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
  /**
   * Search customers Api
   *
   * @returns CustomerEntityApiDTO[]
   */
  public searchCustomersApi(search: CustomerFilterDTO): Observable<CustomerEntityApiDTO[]> {
    return this.http
      .post<CustomerEntityApiDTO[]>(`${this.env.apiBaseUrl}${this.GET_CUSTOMERS_PATH}${this.SEARCH__EXTERNAL_API_PATH}`, search)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
  /**
   * Search repair Orders Api
   *
   * @returns RepairOrderEntityApiDTO[]
   */
  public searchRepairOrdersApi(search: RepairOrderFilterDTO): Observable<RepairOrderEntityApiDTO[]> {
    return this.http
      .post<RepairOrderEntityApiDTO[]>(
        `${this.env.apiBaseUrl}${this.GET_REPAIR_ORDER_PATH}${this.SEARCH__EXTERNAL_API_PATH}`,
        search
      )
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
   * Create customer API
   *
   * @returns CustomerEntityDTO
   */
  public createCustomerApi(customerId: number, facilityId: number): Observable<CustomerEntityDTO> {
    return this.http
      .get<CustomerEntityDTO>(
        `${this.env.apiBaseUrl}${this.GET_CUSTOMERS_PATH}${this.SAVE__EXTERNAL_API_PATH}${customerId}/${facilityId}`
      )
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
  public createVehicle(vehicle: VehicleEntityDTO, cardInstanceId?: number): Observable<VehicleEntityDTO> {
    return this.http
      .post<VehicleEntityDTO>(`${this.env.apiBaseUrl}${this.GET_VEHICLES_PATH}${cardInstanceId ? cardInstanceId : ''}`, vehicle)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Create customer API
   *
   * @returns CustomerEntityDTO
   */
  public createVehicleApi(body: VehicleBodyApiDTO): Observable<VehicleEntityDTO> {
    return this.http
      .post<VehicleEntityDTO>(`${this.env.apiBaseUrl}${this.GET_VEHICLES_PATH}${this.SAVE__EXTERNAL_API_PATH}`, body)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Find RepairOrder
   *
   * @returns RepairOrderEntityDTO
   */
  public getRepairOrder(idRepairOrder: number): Observable<RepairOrderEntityDTO> {
    return this.http
      .get<RepairOrderEntityDTO>(`${this.env.apiBaseUrl}${this.GET_REPAIR_ORDER_PATH}${idRepairOrder}`)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Create RepairOrder
   *
   * @returns RepairOrderEntityDTO
   */
  public createRepairOrder(repairOrder: RepairOrderEntityDTO): Observable<RepairOrderEntityDTO> {
    return this.http
      .post<RepairOrderEntityDTO>(`${this.env.apiBaseUrl}${this.GET_REPAIR_ORDER_PATH}`, repairOrder)
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }

  /**
   * Create Repair Order API
   *
   * @returns RepairOrderEntityDTO
   */
  public createRepairOrderApi(repairOrderId: number, facilityId: number): Observable<RepairOrderEntityDTO> {
    return this.http
      .get<RepairOrderEntityDTO>(
        `${this.env.apiBaseUrl}${this.GET_REPAIR_ORDER_PATH}${this.SAVE__EXTERNAL_API_PATH}${repairOrderId}/${facilityId}`
      )
      .pipe(catchError((error) => throwError(error.error as ConcenetError)));
  }
}
