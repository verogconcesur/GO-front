/* eslint-disable @typescript-eslint/member-ordering */
import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import PaginationResponseI from '@data/interfaces/pagination-response';
import CustomerEntityDTO from '@data/models/entities/customer-entity-dto';
import { ModalAssociatedCardsService } from '@modules/feature-modules/modal-associated-cards/modal-associated-cards.service';
import { TranslateService } from '@ngx-translate/core';
import { CustomDialogService } from '@shared/modules/custom-dialog/services/custom-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { NGXLogger } from 'ngx-logger';
import { Observable, of } from 'rxjs';
import { finalize, map, take } from 'rxjs/operators';
import { EntitiesService } from '../../../../../data/services/entities.service';
import {
  CreateEditCustomerComponentModalEnum,
  ModalCustomerComponent
} from '../../../../feature-modules/modal-customer/modal-customer.component';

@Component({
  selector: 'app-clients-list',
  templateUrl: './clients-list.component.html',
  styleUrls: ['./clients-list.component.scss']
})
export class ClientsListComponent implements OnInit {
  public labels = {
    fullName: marker('users.fullName'),
    socialSecurityId: marker('entities.customers.socialSecurityId'),
    reference: marker('entities.customers.reference'),
    phone: marker('entities.customers.phone'),
    email: marker('entities.customers.email'),
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
  public displayedColumns = ['fullName', 'socialSecurityId', 'reference', 'phone', 'email', 'actions'];
  public dataSource: CustomerEntityDTO[] = [];
  private filterValue: CustomerEntityDTO;
  private textSearchValue = '';

  constructor(
    private entitiesService: EntitiesService,
    private customDialogService: CustomDialogService,
    private logger: NGXLogger,
    private globalMessageService: GlobalMessageService,
    private translateService: TranslateService,
    private spinnerService: ProgressSpinnerDialogService,
    private modalAssociatedCardsService: ModalAssociatedCardsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getCustomer();
  }

  public openCreateEditClientDialog = (client?: CustomerEntityDTO): void => {
    this.customDialogService
      .open({
        id: CreateEditCustomerComponentModalEnum.ID,
        panelClass: CreateEditCustomerComponentModalEnum.PANEL_CLASS,
        component: ModalCustomerComponent,
        extendedComponentData: client ? client : null,
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
          this.getCustomer();
        }
      });
  };

  public getCustomer = (pageEvent?: PageEvent): void => {
    const spinner = this.spinnerService.show();
    if (pageEvent) {
      this.paginationConfig.page = pageEvent.pageIndex;
      this.paginationConfig.pageSize = pageEvent.pageSize;
    } else {
      this.paginationConfig.page = 0;
    }
    this.entitiesService
      .searchCustomerPag(
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
      .pipe(
        take(1),
        finalize(() => this.spinnerService.hide(spinner))
      )
      .subscribe(
        (response: PaginationResponseI<CustomerEntityDTO>) => {
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

  public showCustomerCards(customer: CustomerEntityDTO): void {
    this.modalAssociatedCardsService.openAssociatedCardsModal(customer.id, 'customerId');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private transformFilterValue = (filterValue: CustomerEntityDTO): any => ({
    fullname: filterValue?.fullName,
    email: filterValue?.email,
    phone: filterValue?.phone,
    socialSecurityId: filterValue?.socialSecurityId,
    reference: filterValue?.reference,
    name: filterValue?.name,
    firstName: filterValue?.firstName,
    secondName: filterValue?.secondName,
    id: filterValue?.id
  });

  public showFilterOptionSelected = (opt?: CustomerEntityDTO | string): void => {
    if (opt && typeof opt !== 'string') {
      if (opt.fullName) {
        this.textSearchValue = opt.fullName.toLowerCase();
      } else {
        this.textSearchValue = opt.name.toLowerCase();
        if (opt.firstName) {
          this.textSearchValue += ` ${opt.firstName.toLowerCase()}`;
        }
        if (opt.secondName) {
          this.textSearchValue += ` ${opt.secondName.toLowerCase()}`;
        }
      }
    } else {
      opt = opt ? opt : '';
      this.textSearchValue = opt.toString().toLowerCase();
    }
    this.getCustomer();
  };

  //Invoked on search input
  public getFilteredData = (text: string): Observable<{ content: CustomerEntityDTO[] }> => {
    this.textSearchValue = text;
    if (text.length >= 3) {
      return this.entitiesService
        .searchCustomerPag(
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
          map((response: PaginationResponseI<CustomerEntityDTO>) => ({
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

  public optionLabelFn = (option: CustomerEntityDTO): string => {
    if (option) {
      let fullName = '';
      fullName += option.fullName ? option.fullName : '';
      return fullName;
    }
    return '';
  };
}
