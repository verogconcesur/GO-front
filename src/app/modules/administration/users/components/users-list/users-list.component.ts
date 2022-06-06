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
import { CustomDialogService } from '@shared/modules/custom-dialog/services/custom-dialog.service';
import { FilterDrawerService } from '@shared/modules/filter-drawer/services/filter-drawer.service';
import { Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { UsersFilterComponent } from '../users-filter/users-filter.component';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { TranslateService } from '@ngx-translate/core';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { RoleService } from '@data/services/role.service';

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
    department: marker('userProfile.department'),
    actions: marker('common.actions')
  };

  public paginationConfig = {
    length: 1,
    pageSize: 5,
    pageSizeOptions: [5, 10, 25, 100],
    page: 0,
    ariaLabel: 'Select page'
  };
  public displayedColumns = ['fullName', 'permissionsGroup', 'department', 'actions'];
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
    private roleService: RoleService
  ) {}

  ngOnInit(): void {
    this.getUsers();
    this.setSidenavFilterDrawerConfiguration();
    this.initializeListeners();
  }

  public openCreateEditUserDialog = (user?: UserDetailsDTO): void => {
    this.customDialogService
      .open({
        id: CreateEditUserComponentModalEnum.ID,
        panelClass: CreateEditUserComponentModalEnum.PANEL_CLASS,
        component: CreateEditUserComponent,
        extendedComponentData: user ? user : null,
        disableClose: true
      })
      .pipe(take(1))
      .subscribe((response) => {
        if (response) {
          this.globalMessageService.showSuccess({
            message: this.translateService.instant(marker('common.successOperation')),
            actionText: 'Close'
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
      // this.paginationConfig.length = 1;
      // this.dataSource = [opt];
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

  public getUserDepartments = (user: UserDetailsDTO): string => {
    let departmentsName = '';
    user?.departments?.forEach((deparment: DepartmentDTO) => {
      if (departmentsName) {
        departmentsName += ', ';
      }
      departmentsName += deparment.name;
    });
    return departmentsName;
  };

  public getUsers = (pageEvent?: PageEvent): void => {
    if (pageEvent) {
      this.paginationConfig.page = pageEvent.pageIndex;
      this.paginationConfig.pageSize = pageEvent.pageSize;
    }
    if (!this.filterValue) {
      this.filterValue = {
        brands: [],
        departments: [],
        email: '',
        facilities: [],
        roles: [],
        search: '',
        specialties: []
      };
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
      .subscribe((response: PaginationResponseI<UserDetailsDTO>) => {
        this.paginationConfig.length = response.totalElements;
        this.dataSource = response.content;
      });
  };

  public optionLabelFn = (option: UserDetailsDTO): string => {
    if (option) {
      return `${option.name} ${option.firstName} ${option.lastName}`;
    }
    return '';
  };

  public areFiltersSettedAndActive = (): boolean =>
    this.filterValue.brands?.length > 0 ||
    this.filterValue.departments?.length > 0 ||
    this.filterValue.facilities?.length > 0 ||
    this.filterValue.roles?.length > 0 ||
    this.filterValue.specialties?.length > 0;

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
                  actionText: 'Close'
                });
                this.getUsers();
              },
              error: (error) => {
                this.globalMessageService.showError({
                  message: this.translateService.instant(marker('common.successOperation')),
                  actionText: 'Close'
                });
              }
            });
        }
      });
  };

  private setSidenavFilterDrawerConfiguration = () => {
    this.filterDrawerService.setComponentToShowInsideFilterDrawer(UsersFilterComponent);
    this.filterDrawerService.filterValueSubject$.pipe(untilDestroyed(this)).subscribe((filterValue: UserFilterDTO) => {
      this.filterValue = filterValue;
      this.getUsers();
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private transformFilterValue = (filterValue: UserFilterDTO): any => ({
    email: filterValue.email,
    search: filterValue.search,
    brands: filterValue.brands.map((brand: BrandDTO) => brand.id),
    departments: filterValue.departments.map((dep: DepartmentDTO) => dep.id),
    facilities: filterValue.facilities.map((fac: BrandDTO) => fac.id),
    roles: filterValue.roles.map((role: BrandDTO) => role.id),
    specialties: filterValue.specialties.map((spec: BrandDTO) => spec.id)
  });

  private initializeListeners(): void {
    this.roleService.rolesChange$.pipe(untilDestroyed(this)).subscribe({
      next: (change) => {
        this.getUsers();
      }
    });
  }
}
