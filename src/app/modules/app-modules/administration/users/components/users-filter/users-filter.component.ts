import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Observable, of } from 'rxjs';
import { FilterDrawerClassToExnted } from '@modules/feature-modules/filter-drawer/models/filter-drawer-class-to-extend.component';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RoleService } from '@data/services/role.service';
import RoleDTO from '@data/models/user-permissions/role-dto';
import UserFilterDTO from '@data/models/user-permissions/user-filter-dto';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FilterDrawerService } from '@modules/feature-modules/filter-drawer/services/filter-drawer.service';
// eslint-disable-next-line max-len
import { OrganizationLevelsNestedCombosComponent } from '@modules/feature-modules/organization-levels-nested-combos/organization-levels-nested-combos.component';

@UntilDestroy()
@Component({
  selector: 'app-users-filter',
  templateUrl: './users-filter.component.html',
  styleUrls: ['./users-filter.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UsersFilterComponent extends FilterDrawerClassToExnted implements OnInit {
  @ViewChild('OrganizationLevelsNestedCombos') organizationLevelsNestedCombos: OrganizationLevelsNestedCombosComponent;
  public labels = {
    role: marker('userProfile.role'),
    brand: marker('userProfile.brand'),
    facility: marker('userProfile.facility'),
    department: marker('userProfile.department'),
    specialty: marker('userProfile.specialty')
  };
  public filterForm: FormGroup;
  public rolesAsyncList: Observable<RoleDTO[]>;

  constructor(private fb: FormBuilder, private roleService: RoleService, private filterDrawerService: FilterDrawerService) {
    super();
  }

  ngOnInit(): void {
    this.initializeForm();
    this.getListOptions();
    this.initializeListeners();
  }

  public resetFilter(value?: UserFilterDTO): Observable<UserFilterDTO> {
    this.filterForm.reset();
    if (value) {
      this.filterForm.setValue({
        roles: value.roles,
        brands: value.brands,
        facilities: value.facilities,
        departments: value.departments,
        specialties: value.specialties
      });
    } else {
      this.filterForm.get('roles').setValue([]);
      this.filterForm.get('brands').setValue([]);
      this.filterForm.get('facilities').setValue([]);
      this.filterForm.get('departments').setValue([]);
      this.filterForm.get('specialties').setValue([]);
    }
    this.organizationLevelsNestedCombos.getDepartmentsOptions();
    this.organizationLevelsNestedCombos.getBrandsOptions();
    return of(this.filterForm.value);
  }
  public submitFilter(): Observable<UserFilterDTO> {
    return of(this.filterForm.value);
  }
  public isFilterFormTouchedOrDirty(): boolean {
    return this.filterForm?.dirty;
  }
  public isFilterFormValid(): boolean {
    return this.filterForm?.valid;
  }
  public getFilterFormValue(): UserFilterDTO {
    return this.filterForm?.value;
  }

  get form() {
    return this.filterForm.controls;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public setDefaultValueAfterInit(data: any): void {
    this.defaultValue = data;
    this.filterDrawerService.filterValueSubject$.next({
      brands: this.defaultValue?.brands ? this.defaultValue.brands : [],
      departments: this.defaultValue?.departments ? this.defaultValue.departments : [],
      facilities: this.defaultValue?.facilities ? this.defaultValue.facilities : [],
      roles: this.defaultValue?.roles ? this.defaultValue.roles : [],
      specialties: this.defaultValue?.specialties ? this.defaultValue.specialties : []
    });
  }

  private getListOptions(): void {
    this.rolesAsyncList = this.roleService.getAllRoles();
  }

  private initializeForm(): void {
    this.filterForm = this.fb.group({
      roles: [[]],
      brands: [[]],
      facilities: [[]],
      departments: [[]],
      specialties: [[]]
    });
    ['brands', 'facilities', 'departments', 'specialties'].forEach((k) => {
      if (this.defaultValue && this.defaultValue[k] && this.defaultValue[k].length) {
        this.filterForm.get(k).setValue(this.defaultValue[k]);
      }
    });
  }

  private initializeListeners(): void {
    //If a role is created we must create this listener because the filter must reload the options
    this.roleService.rolesChange$.pipe(untilDestroyed(this)).subscribe({
      next: (change) => {
        this.getListOptions();
      }
    });
  }
}
