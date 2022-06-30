import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import PaginationResponseI from '@data/interfaces/pagination-response';
import BrandDTO from '@data/models/brand-dto';
import DepartmentDTO from '@data/models/department-dto';
import UserDetailsDTO from '@data/models/user-details-dto';
import UserFilterDTO from '@data/models/user-filter-dto';
import { UserService } from '@data/services/user.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  CreateEditUserComponent,
  CreateEditUserComponentModalEnum
} from '@modules/administration/users/components/create-edit-user/create-edit-user.component';
import { CustomDialogService } from '@jenga/custom-dialog';
import { FilterDrawerService } from '@shared/modules/filter-drawer/services/filter-drawer.service';
import { Observable, of } from 'rxjs';
import { finalize, map, take } from 'rxjs/operators';
import { UsersFilterComponent } from '../users-filter/users-filter.component';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { TranslateService } from '@ngx-translate/core';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { RoleService } from '@data/services/role.service';
import FacilityDTO from '@data/models/facility-dto';
import SpecialtyDTO from '@data/models/specialty-dto';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';

@UntilDestroy()
@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss']
})
export class UsersListComponent implements OnInit {
  public labels = {
    fullName: marker('users.fullName'),
    permissionsGroup: marker('users.permissionsGroup'),
    brand: marker('userProfile.brand'),
    facility: marker('userProfile.facility'),
    department: marker('userProfile.department'),
    specialty: marker('userProfile.specialty'),
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
  public displayedColumns = ['fullName', 'permissionsGroup', 'brand', 'facility', 'department', 'specialty', 'actions'];
  public dataSource: UserDetailsDTO[] = [];
  private filterValue: UserFilterDTO;
  private textSearchValue = '';

  constructor(
    private userService: UserService,
    private customDialogService: CustomDialogService,
    private filterDrawerService: FilterDrawerService,
    private confirmationDialog: ConfirmDialogService,
    private globalMessageService: GlobalMessageService,
    private translateService: TranslateService,
    private roleService: RoleService,
    private spinnerService: ProgressSpinnerDialogService
  ) {}

  ngOnInit(): void {
    this.setInitialFilterValue();
    this.setSidenavFilterDrawerConfiguration();
    this.initializeListeners();
  }

  public setInitialFilterValue(): void {
    const historyState = history.state as {
      brands: BrandDTO[];
      departments: DepartmentDTO[];
      facilities: FacilityDTO[];
      specialties: SpecialtyDTO[];
    };
    this.filterValue = {
      brands: historyState?.brands ? historyState.brands : [],
      departments: historyState?.departments ? historyState.departments : [],
      email: '',
      facilities: historyState?.facilities ? historyState.facilities : [],
      roles: [],
      search: '',
      specialties: historyState?.specialties ? historyState.specialties : []
    };
  }

  public openCreateEditUserDialog = (user?: UserDetailsDTO): void => {
    this.customDialogService
      .open({
        id: CreateEditUserComponentModalEnum.ID,
        panelClass: CreateEditUserComponentModalEnum.PANEL_CLASS,
        component: CreateEditUserComponent,
        extendedComponentData: user ? user : null,
        disableClose: true,
        width: '700px'
      })
      .pipe(take(1))
      .subscribe((response) => {
        if (response) {
          this.globalMessageService.showSuccess({
            message: this.translateService.instant(marker('common.successOperation')),
            actionText: this.translateService.instant(marker('common.close'))
          });
          this.getUsers();
        }
      });
  };

  public openFilterUserDialog = (): void => {
    this.filterDrawerService.toggleFilterDrawer();
  };

  public showFilterOptionSelected = (opt?: UserDetailsDTO | string): void => {
    if (opt && typeof opt !== 'string') {
      this.textSearchValue = this.optionLabelFn(opt).toLowerCase();
    } else {
      opt = opt ? opt : '';
      this.textSearchValue = opt.toString().toLowerCase();
    }
    this.getUsers();
  };

  //Invoked on search input
  public getFilteredData = (
    text: string
  ): Observable<{ content: UserDetailsDTO[]; optionLabelFn: (option: UserDetailsDTO) => string }> => {
    this.textSearchValue = text;
    if (text.length >= 3) {
      return this.userService
        .searchUsers(
          {
            ...this.transformFilterValue(this.filterValue),
            search: this.textSearchValue,
            email: ''
          },
          {
            page: 0,
            size: 20
          }
        )
        .pipe(
          map((response: PaginationResponseI<UserDetailsDTO>) => ({
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

  public getUserOrganizationLabel = (data: BrandDTO[] | FacilityDTO[] | DepartmentDTO[] | SpecialtyDTO[]): string => {
    let label = '';
    data = data && Array.isArray(data) ? data : [];
    data.forEach((item: BrandDTO | FacilityDTO | DepartmentDTO | SpecialtyDTO) => {
      if (label) {
        label += ', ';
      }
      label += item.name;
    });
    return label;
  };

  public getUsers = (pageEvent?: PageEvent): void => {
    const spinner = this.spinnerService.show();
    if (pageEvent) {
      this.paginationConfig.page = pageEvent.pageIndex;
      this.paginationConfig.pageSize = pageEvent.pageSize;
    } else {
      this.paginationConfig.page = 0;
    }
    this.userService
      .searchUsers(
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
      .subscribe((response: PaginationResponseI<UserDetailsDTO>) => {
        this.paginationConfig.length = response.totalElements;
        this.dataSource = response.content;
      });
  };

  public optionLabelFn = (option: UserDetailsDTO): string => {
    if (option) {
      let fullName = '';
      fullName += option.name ? option.name : '';
      fullName += option.firstName ? ' ' + option.firstName : '';
      fullName += option.lastName ? ' ' + option.lastName : '';
      return fullName;
    }
    return '';
  };

  public areFiltersSettedAndActive = (): boolean =>
    this.filterValue?.brands?.length > 0 ||
    this.filterValue?.departments?.length > 0 ||
    this.filterValue?.facilities?.length > 0 ||
    this.filterValue?.roles?.length > 0 ||
    this.filterValue?.specialties?.length > 0;

  public deleteUser = (user: UserDetailsDTO): void => {
    this.confirmationDialog
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('user.deleteConfirmation'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          this.userService
            .deleteUser(user)
            .pipe(take(1))
            .subscribe({
              next: (response) => {
                this.globalMessageService.showSuccess({
                  message: this.translateService.instant(marker('common.successOperation')),
                  actionText: this.translateService.instant(marker('common.close'))
                });
                this.getUsers();
              },
              error: (error) => {
                this.globalMessageService.showError({
                  message: this.translateService.instant(marker('common.successOperation')),
                  actionText: this.translateService.instant(marker('common.close'))
                });
              }
            });
        }
      });
  };

  private setSidenavFilterDrawerConfiguration = () => {
    this.filterDrawerService.setComponentToShowInsideFilterDrawer(UsersFilterComponent, this.filterValue);
    this.filterDrawerService.filterValueSubject$.pipe(untilDestroyed(this)).subscribe((filterValue: UserFilterDTO) => {
      this.filterValue = filterValue;
      setTimeout(() => this.getUsers());
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private transformFilterValue = (filterValue: UserFilterDTO): any => ({
    email: filterValue?.email,
    search: filterValue?.search,
    brands: filterValue?.brands?.map((brand: BrandDTO) => brand.id),
    departments: filterValue?.departments?.map((dep: DepartmentDTO) => dep.id),
    facilities: filterValue?.facilities?.map((fac: FacilityDTO) => fac.id),
    roles: filterValue?.roles?.map((role: BrandDTO) => role.id),
    specialties: filterValue?.specialties?.map((spec: BrandDTO) => spec.id)
  });

  private initializeListeners(): void {
    this.roleService.rolesChange$.pipe(untilDestroyed(this)).subscribe({
      next: (change) => {
        this.getUsers();
      }
    });
  }
}
