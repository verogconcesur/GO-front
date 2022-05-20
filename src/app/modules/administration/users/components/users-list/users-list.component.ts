import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import PaginationResponseI from '@data/interfaces/pagination-response';
import DepartmentDTO from '@data/models/department-dto';
import UserDetailsDTO from '@data/models/user-details-dto';
import { UserService } from '@data/services/user.service';

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

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.getUsers();
  }

  public getUserDepartments(user: UserDetailsDTO): string {
    let departmentsName = '';
    user.departments.forEach((deparment: DepartmentDTO) => {
      if (departmentsName) {
        departmentsName += ', ';
      }
      departmentsName += deparment.name;
    });
    return departmentsName;
  }

  public getUsers(pageEvent?: PageEvent): void {
    if (pageEvent) {
      this.paginationConfig.page = pageEvent.pageIndex;
      this.paginationConfig.pageSize = pageEvent.pageSize;
    }

    this.userService
      .searchUsers(
        {
          brands: [],
          departments: [],
          email: '',
          facilities: [],
          roles: [],
          search: '',
          specialties: []
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
  }
}
