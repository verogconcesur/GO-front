import { Component, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import PaginationResponseI from '@data/interfaces/pagination-response';
import BrandDTO from '@data/models/organization/brand-dto';
import DepartmentDTO from '@data/models/organization/department-dto';
import FacilityDTO from '@data/models/organization/facility-dto';
import SpecialtyDTO from '@data/models/organization/specialty-dto';
import RoleDTO from '@data/models/user-permissions/role-dto';
import UserDetailsDTO from '@data/models/user-permissions/user-details-dto';
import UserFilterDTO from '@data/models/user-permissions/user-filter-dto';
import { UserService } from '@data/services/user.service';
import { ComponentToExtendForCustomDialog, CustomDialogFooterConfigI } from '@jenga/custom-dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { Observable, of } from 'rxjs';
import { take } from 'rxjs/operators';

export const enum UserSearcherDialogComponentModalEnum {
  ID = 'user-searcher-dialog-id',
  PANEL_CLASS = 'user-searcher-dialog',
  TITLE = 'user.searchDialog'
}

@UntilDestroy()
@Component({
  selector: 'app-user-searcher-dialog',
  templateUrl: './user-searcher-dialog.component.html',
  styleUrls: ['./user-searcher-dialog.component.scss']
})
export class UserSearcherDialogComponent extends ComponentToExtendForCustomDialog implements OnInit {
  public labels = {
    title: marker(UserSearcherDialogComponentModalEnum.TITLE),
    searchLabel: marker('common.type3CharsToSearch'),
    fullName: marker('users.fullName'),
    permissionsGroup: marker('users.permissionsGroup'),
    brand: marker('userProfile.brand'),
    facility: marker('userProfile.facility'),
    department: marker('userProfile.department'),
    specialty: marker('userProfile.specialty'),
    actions: marker('common.actions'),
    noDataToShow: marker('errors.noDataToShow')
  };
  public filterTextSearchControl = new UntypedFormControl();
  public paginationConfig = {
    length: 1,
    pageSize: 5,
    pageSizeOptions: [5, 10, 25, 100],
    page: 0,
    ariaLabel: 'Select page'
  };
  // public displayedColumns = ['fullName', 'permissionsGroup', 'brand', 'facility', 'department', 'specialty', 'actions'];
  public displayedColumns = ['fullName', 'permissionsGroup', 'actions'];
  public dataSource: UserDetailsDTO[] = [];
  public selectedUsers: UserDetailsDTO[] = [];
  private usersFilter: UserFilterDTO;
  private minStringLengthBeforeSeach = 3;

  constructor(
    private confirmDialogService: ConfirmDialogService,
    private translateService: TranslateService,
    private userService: UserService
  ) {
    super(UserSearcherDialogComponentModalEnum.ID, UserSearcherDialogComponentModalEnum.PANEL_CLASS, marker('user.searchDialog'));
  }

  ngOnInit(): void {
    this.usersFilter = { ...this.extendedComponentData, roles: [] };
    this.filterTextSearchControl.valueChanges.pipe(untilDestroyed(this)).subscribe((value) => {
      if (value.length >= this.minStringLengthBeforeSeach) {
        this.searchAction();
      } else {
        this.dataSource = [];
      }
    });
  }

  public searchAction(pageEvent?: PageEvent) {
    this.usersFilter.search = this.filterTextSearchControl.value;
    if (pageEvent) {
      this.paginationConfig.page = pageEvent.pageIndex;
      this.paginationConfig.pageSize = pageEvent.pageSize;
    } else {
      this.paginationConfig.page = 0;
    }
    this.userService
      .searchUsers(this.usersFilter, {
        page: this.paginationConfig.page,
        size: this.paginationConfig.pageSize
      })
      .pipe(take(1))
      .subscribe((response: PaginationResponseI<UserDetailsDTO>) => {
        this.paginationConfig.length = response.totalElements;
        this.dataSource = response.content;
      });
  }

  public addOrRemoveUser(user: UserDetailsDTO): void {
    if (!this.selectedUsers.find((u) => u.id === user.id)) {
      this.selectedUsers.push(user);
    } else {
      this.selectedUsers.splice(this.selectedUsers.indexOf(user), 1);
    }
  }

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

  public getNumberOfUsersSelected(): string {
    if (this.selectedUsers.length > 0) {
      return this.translateService.instant('users.usersSelected', { count: this.selectedUsers.length });
    }
    return '';
  }

  /** Abstract functions */
  public confirmCloseCustomDialog(): Observable<boolean> {
    return of(true);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public onSubmitCustomDialog(): Observable<any> {
    return of(this.selectedUsers);
  }

  public getButtonLabel(user: UserDetailsDTO): string {
    if (this.selectedUsers.indexOf(user) >= 0) {
      return marker('common.unselect');
    }
    return marker('common.select');
  }

  public setAndGetFooterConfig(): CustomDialogFooterConfigI | null {
    return {
      show: true,
      leftSideButtons: [
        {
          type: 'custom',
          label: marker('common.unselectAll'),
          design: 'raised',
          color: 'warn',
          hiddenFn: () => !(this.selectedUsers?.length >= 1),
          clickFn: () => (this.selectedUsers = [])
        }
      ],
      rightSideButtons: [
        {
          type: 'submit',
          label: marker('common.add'),
          design: 'raised',
          color: 'primary',
          disabledFn: () => !(this.selectedUsers?.length >= 1)
        }
      ]
    };
    /* End abstract functions */
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public transformFilterValue(filterValue: UserFilterDTO): any {
    return {
      email: filterValue?.email,
      search: filterValue?.search,
      brands: filterValue?.brands?.map((brand: BrandDTO) => brand.id),
      departments: filterValue?.departments?.map((dep: DepartmentDTO) => dep.id),
      facilities: filterValue?.facilities?.map((fac: FacilityDTO) => fac.id),
      roles: filterValue?.roles?.map((role: RoleDTO) => role.id),
      specialties: filterValue?.specialties?.map((spec: SpecialtyDTO) => spec.id)
    };
  }
}
