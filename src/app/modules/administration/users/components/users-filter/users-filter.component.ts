import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { FilterDrawerClassToExnted } from '@shared/modules/filter-drawer/models/filter-drawer-class-to-extend.component';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RoleService } from '@data/services/role.service';
import { BrandService } from '@data/services/brand.service';
import { DepartmentService } from '@data/services/deparment.service';
import { FacilityService } from '@data/services/facility.sevice';
import { SpecialtyService } from '@data/services/specialty.service';
import { NGXLogger } from 'ngx-logger';
import RoleDTO from '@data/models/role-dto';
import BrandDTO from '@data/models/brand-dto';
import FacilitiesGroupedByBrand from '@data/interfaces/facilities-grouped-by-brand';
import DepartmentsGroupedByFacility from '@data/interfaces/departments-grouped-by-facility';
import SpecialtiesGroupedByDepartment from '@data/interfaces/specialties-grouped-by-department';
import DepartmentDTO from '@data/models/department-dto';
import FacilityDTO from '@data/models/facility-dto';
import SpecialtyDTO from '@data/models/specialty-dto';
import { take } from 'rxjs/operators';
import UserFilterDTO from '@data/models/user-filter-dto';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-users-filter',
  templateUrl: './users-filter.component.html',
  styleUrls: ['./users-filter.component.scss']
})
export class UsersFilterComponent extends FilterDrawerClassToExnted implements OnInit {
  public labels = {
    role: marker('userProfile.role'),
    brand: marker('userProfile.brand'),
    facility: marker('userProfile.facility'),
    department: marker('userProfile.department'),
    specialty: marker('userProfile.specialty')
  };
  public filterForm: FormGroup;
  public rolesAsyncList: Observable<RoleDTO[]>;
  public brandsAsyncList: Observable<BrandDTO[]>;
  public facilitiesList: FacilitiesGroupedByBrand[];
  public departmentsList: DepartmentsGroupedByFacility[];
  public specialtiesList: SpecialtiesGroupedByDepartment[];

  constructor(
    private fb: FormBuilder,
    private logger: NGXLogger,
    private roleService: RoleService,
    private brandService: BrandService,
    private facilitySevice: FacilityService,
    private departmentService: DepartmentService,
    private specialtyService: SpecialtyService
  ) {
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
      this.filterForm.setValue(value);
    } else {
      this.filterForm.get('roles').setValue([]);
      this.filterForm.get('brands').setValue([]);
      this.filterForm.get('facilities').setValue([]);
      this.filterForm.get('departments').setValue([]);
      this.filterForm.get('specialties').setValue([]);
    }
    this.getFacilitiesOptions();
    return of(this.filterForm.value);
  }
  public submitFilter(): Observable<UserFilterDTO> {
    return of(this.filterForm.value);
  }
  public isFilterFormTouchedOrDirty(): boolean {
    return this.filterForm?.touched || this.filterForm?.dirty;
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
  public getFacilitiesOptions(): void {
    this.facilitySevice
      .getFacilitiesOptionsListByBrands(this.filterForm.get('brands').value)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.facilitiesList = response;
          let selected = this.filterForm.get('facilities').value ? this.filterForm.get('facilities').value : [];
          selected = selected.filter(
            (facility: FacilityDTO) =>
              this.facilitiesList.filter(
                (fg: FacilitiesGroupedByBrand) => fg.facilities.filter((f: FacilityDTO) => f.id === facility.id).length > 0
              ).length > 0
          );
          this.filterForm.get('facilities').setValue(selected);
          this.getDepartmentsOptions();
        },
        error: (error) => {
          this.logger.error(error);
        }
      });
  }

  public getDepartmentsOptions(): void {
    this.departmentService
      .getDepartmentOptionsListByFacilities(this.filterForm.get('facilities').value)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.departmentsList = response;
          let selected = this.filterForm.get('departments').value ? this.filterForm.get('departments').value : [];
          selected = selected.filter(
            (department: DepartmentDTO) =>
              this.departmentsList.filter(
                (dg: DepartmentsGroupedByFacility) =>
                  dg.departments.filter((d: DepartmentDTO) => d.id === department.id).length > 0
              ).length > 0
          );
          this.filterForm.get('departments').setValue(selected);
          this.getSpecialtiesOptions();
        },
        error: (error) => {
          this.logger.error(error);
        }
      });
  }

  public getSpecialtiesOptions(): void {
    this.specialtyService
      .getSpecialtyOptionsListByDepartments(this.filterForm.get('departments').value)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.specialtiesList = response;
          let selected = this.filterForm.get('specialties').value ? this.filterForm.get('specialties').value : [];
          selected = selected.filter(
            (specialty: SpecialtyDTO) =>
              this.specialtiesList.filter(
                (sg: SpecialtiesGroupedByDepartment) =>
                  sg.specialties.filter((s: SpecialtyDTO) => s.id === specialty.id).length > 0
              ).length > 0
          );
          this.filterForm.get('specialties').setValue(selected);
        },
        error: (error) => {
          this.logger.error(error);
        }
      });
  }

  private getListOptions(): void {
    this.rolesAsyncList = this.roleService.getAllRoles();
    this.brandsAsyncList = this.brandService.getAllBrands();
    this.facilitiesList = [];
    this.departmentsList = [];
    this.specialtiesList = [];
  }

  private initializeForm(): void {
    this.filterForm = this.fb.group({
      roles: [[]],
      brands: [[]],
      facilities: [[]],
      departments: [[]],
      specialties: [[]]
    });
  }

  private initializeListeners(): void {
    this.roleService.rolesChange$.pipe(untilDestroyed(this)).subscribe({
      next: (change) => {
        this.getListOptions();
      }
    });
  }
}
