/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable max-len */
import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import PaginationResponseI from '@data/interfaces/pagination-response';
import VehicleEntityDTO from '@data/models/entities/vehicle-entity-dto';
import { EntitiesService } from '@data/services/entities.service';
import { CustomDialogService } from '@jenga/custom-dialog';
import {
  CreateEditVehicleComponentModalEnum,
  ModalVehicleComponent
} from '@modules/feature-modules/modal-vehicle/modal-vehicle.component';
import { TranslateService } from '@ngx-translate/core';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { NGXLogger } from 'ngx-logger';
import { Observable, of } from 'rxjs';
import { finalize, map, take } from 'rxjs/operators';

@Component({
  selector: 'app-vehicles-list',
  templateUrl: './vehicles-list.component.html',
  styleUrls: ['./vehicles-list.component.scss']
})
export class VehiclesListComponent implements OnInit {
  public labels = {
    licensePlate: marker('entities.vehicles.licensePlate'),
    make: marker('entities.vehicles.make'),
    chasis: marker('entities.vehicles.chasis'),
    model: marker('entities.vehicles.model'),
    vehicleId: marker('entities.vehicles.vehicleId'),
    description: marker('entities.vehicles.description'),
    vin: marker('entities.vehicles.vin'),
    actions: marker('common.actions'),
    noDataToShow: marker('errors.noDataToShow')
  };
  public paginationConfig = {
    length: 1,
    pageSize: 5,
    pageSizeOptions: [5, 10, 25, 100],
    page: 0,
    ariaLabel: 'Select page'
  };

  public displayedColumns = ['licensePlate', 'make', 'vin', 'description', 'model', 'vehicleId', 'chasis', 'actions'];
  public dataSource: VehicleEntityDTO[] = [];
  private filterValue: VehicleEntityDTO;
  private textSearchValue = '';
  constructor(
    private entitiesService: EntitiesService,
    private customDialogService: CustomDialogService,
    private logger: NGXLogger,
    private globalMessageService: GlobalMessageService,
    private translateService: TranslateService,
    private spinnerService: ProgressSpinnerDialogService
  ) {}

  ngOnInit(): void {
    this.getVehicles();
  }

  public openCreateEditVehicleDialog = (vehicle?: VehicleEntityDTO): void => {
    this.customDialogService
      .open({
        id: CreateEditVehicleComponentModalEnum.ID,
        panelClass: CreateEditVehicleComponentModalEnum.PANEL_CLASS,
        component: ModalVehicleComponent,
        extendedComponentData: vehicle ? vehicle : null,
        disableClose: true,
        width: '900px'
      })
      .pipe(take(1))
      .subscribe((response) => {
        if (response) {
          this.globalMessageService.showSuccess({
            message: this.translateService.instant(marker('common.successOperation')),
            actionText: this.translateService.instant(marker('common.close'))
          });
          this.getVehicles();
        }
      });
  };

  public getVehicles = (pageEvent?: PageEvent): void => {
    const spinner = this.spinnerService.show();
    if (pageEvent) {
      this.paginationConfig.page = pageEvent.pageIndex;
      this.paginationConfig.pageSize = pageEvent.pageSize;
    } else {
      this.paginationConfig.page = 0;
    }
    this.entitiesService
      .searchVehiclesPag(
        {
          ...this.transformFilterValue(this.filterValue),
          email: '',
          search: this.textSearchValue
        },
        {
          page: this.paginationConfig.page,
          size: this.paginationConfig.pageSize
        }
      )
      .pipe(finalize(() => this.spinnerService.hide(spinner)))
      .subscribe(
        (response: PaginationResponseI<VehicleEntityDTO>) => {
          this.paginationConfig.length = response.totalElements;
          this.dataSource = response.content;
        },
        (error) => {
          this.logger.error(error);
          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
        }
      );
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private transformFilterValue = (filterValue: VehicleEntityDTO): any => ({
    chasis: filterValue?.chasis,
    vehicleId: filterValue?.vehicleId,
    model: filterValue?.model,
    make: filterValue?.make,
    description: filterValue?.description,
    id: filterValue?.id,
    licensePlate: filterValue?.licensePlate,
    reference: filterValue?.reference,
    vin: filterValue?.vin
  });

  public showFilterOptionSelected = (opt?: VehicleEntityDTO | string): void => {
    if (opt && typeof opt !== 'string') {
      this.textSearchValue = opt.licensePlate.toLowerCase();
    } else {
      opt = opt ? opt : '';
      this.textSearchValue = opt.toString().toLowerCase();
    }
    this.getVehicles();
  };

  //Invoked on search input
  public getFilteredData = (text: string): Observable<{ content: VehicleEntityDTO[] }> => {
    this.textSearchValue = text;
    if (text.length >= 3) {
      return this.entitiesService
        .searchVehiclesPag(
          {
            search: this.textSearchValue
          },
          {
            page: 0,
            size: 20
          }
        )
        .pipe(
          take(1),
          map((response: PaginationResponseI<VehicleEntityDTO>) => ({
            content: response.content,
            optionLabelFn: this.optionLabelFn
          }))
        );
    } else {
      return of({
        content: [],
        optionLabelFn: this.optionLabelFn
      });
    }
  };
  public optionLabelFn = (option: VehicleEntityDTO): string => {
    if (option) {
      let licensePlate = '';
      licensePlate += option.licensePlate ? option.licensePlate : '';
      return licensePlate;
    }
    return '';
  };
}
