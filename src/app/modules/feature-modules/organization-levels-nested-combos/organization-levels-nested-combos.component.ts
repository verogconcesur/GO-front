/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, UntypedFormGroup } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import DepartmentsGroupedByFacility from '@data/interfaces/departments-grouped-by-facility';
import SpecialtiesGroupedByDepartment from '@data/interfaces/specialties-grouped-by-department';
import BrandDTO from '@data/models/organization/brand-dto';
import DepartmentDTO from '@data/models/organization/department-dto';
import FacilityDTO from '@data/models/organization/facility-dto';
import SpecialtyDTO from '@data/models/organization/specialty-dto';
import { BrandService } from '@data/services/brand.service';
import { DepartmentService } from '@data/services/deparment.service';
import { FacilityService } from '@data/services/facility.sevice';
import { SpecialtyService } from '@data/services/specialty.service';
import { haveArraysSameValues } from '@shared/utils/array-comparation-function';
import { NGXLogger } from 'ngx-logger';
import { Observable } from 'rxjs';
import { tap, take } from 'rxjs/operators';

@Component({
  selector: 'app-organization-levels-nested-combos, [organizationLevelsNestedCombos]',
  templateUrl: './organization-levels-nested-combos.component.html',
  styleUrls: ['./organization-levels-nested-combos.component.scss']
})
export class OrganizationLevelsNestedCombosComponent implements OnInit, OnDestroy {
  @Input() form: UntypedFormGroup;
  //Brands is always shown
  @Input() levelsToShow: { specialties: boolean; departments: boolean; brands: boolean } = {
    specialties: true,
    departments: true,
    brands: true
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Output() setDefaultValueAfterInit: EventEmitter<any> = new EventEmitter<any>();
  public labels = {
    brand: marker('userProfile.brand'),
    facility: marker('userProfile.facility'),
    department: marker('userProfile.department'),
    specialty: marker('userProfile.specialty'),
    selectAll: marker('users.roles.selectAll'),
    unselectAll: marker('common.unselectAll'),
    required: marker('errors.required')
  };
  public facilitiesAsyncList: Observable<FacilityDTO[]>;
  public facilitiesList: FacilityDTO[] = [];
  public brandsList: BrandDTO[] = [];
  public departmentsList: DepartmentsGroupedByFacility[];
  public specialtiesList: SpecialtiesGroupedByDepartment[];

  constructor(
    private logger: NGXLogger,
    private brandService: BrandService,
    private facilitySevice: FacilityService,
    private departmentService: DepartmentService,
    private specialtyService: SpecialtyService
  ) {}

  get formControls() {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.getListOptions();
  }

  ngOnDestroy(): void {
    this.facilitySevice.resetFacilitiesData();
    this.departmentService.resetDepartmentsData();
    this.specialtyService.resetSpecialtiesData();
  }

  public selectAll(type: 'specialties' | 'departments' | 'facilities' | 'brands', control: AbstractControl, list: any[]) {
    if (type === 'facilities' || type === 'brands') {
      control.setValue(list);
    } else {
      control.setValue(list.reduce((prev, act) => [...prev, ...act[type]], []));
    }
    this.getOptionsAfterSelection(type);
  }

  public unselectAll(type: 'specialties' | 'departments' | 'facilities' | 'brands', control: AbstractControl) {
    control.setValue([]);
    this.getOptionsAfterSelection(type);
  }

  public hasAllSelected(
    type: 'specialties' | 'departments' | 'facilities' | 'brands',
    control: AbstractControl,
    list: any[]
  ): boolean {
    if (type !== 'facilities' && type !== 'brands') {
      list = list.reduce((prev, act) => [...prev, ...act[type]], []);
    }
    const actualValue = control.value ? control.value : [];
    return (
      list &&
      haveArraysSameValues(
        actualValue.map((item: any) => (item?.id ? item.id : null)).sort(),
        list.map((item: any) => (item?.id ? item.id : null)).sort()
      )
    );
  }

  public getOptionsAfterSelection(type: 'specialties' | 'departments' | 'facilities' | 'brands') {
    switch (type) {
      case 'facilities':
        if (this.levelsToShow.departments) {
          this.getDepartmentsOptions();
        }
        if (this.levelsToShow.brands) {
          this.getBrandsOptions();
        }
        break;
      case 'departments':
        if (this.levelsToShow.specialties) {
          this.getSpecialtiesOptions();
        }
        break;
    }
  }

  public getBrandsOptions(init?: boolean): void {
    this.brandService
      .getAllBrands(this.form.get('facilities').value.map((fac: FacilityDTO) => fac.id))
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.brandsList = response;
          this.form
            .get('brands')
            .setValue(
              this.form.get('brands').value?.length
                ? this.form
                    .get('brands')
                    .value.map((brandSelec: BrandDTO) => response.find((brand) => brandSelec.id === brand.id))
                : null
            );
        },
        error: (error) => {
          this.logger.error(error);
        }
      });
  }

  public getDepartmentsOptions(init?: boolean): void {
    this.departmentService
      .getDepartmentOptionsListByFacilities(this.form.get('facilities').value)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.departmentsList = response;
          let selected = this.form.get('departments').value ? this.form.get('departments').value : [];
          selected = selected.filter(
            (department: DepartmentDTO) =>
              this.departmentsList.filter(
                (dg: DepartmentsGroupedByFacility) =>
                  dg.departments.filter((d: DepartmentDTO) => d.id === department.id).length > 0
              ).length > 0
          );

          selected = selected.map((department: DepartmentDTO) => {
            let itemToReturn = department;
            this.departmentsList.find((dg: DepartmentsGroupedByFacility) =>
              dg.departments.find((d: DepartmentDTO) => {
                if (d.id === department.id) {
                  itemToReturn = d;
                  return true;
                }
                return false;
              })
            );
            return itemToReturn;
          });
          this.form.get('departments').setValue(selected);
          if (this.levelsToShow.specialties) {
            this.getSpecialtiesOptions(init);
          }
        },
        error: (error) => {
          this.logger.error(error);
        }
      });
  }

  public getSpecialtiesOptions(init?: boolean): void {
    this.specialtyService
      .getSpecialtyOptionsListByDepartments(this.form.get('departments').value)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.specialtiesList = response;
          let selected = this.form.get('specialties').value ? this.form.get('specialties').value : [];
          selected = selected.filter(
            (specialty: SpecialtyDTO) =>
              this.specialtiesList.filter(
                (sg: SpecialtiesGroupedByDepartment) =>
                  sg.specialties.filter((s: SpecialtyDTO) => s.id === specialty.id).length > 0
              ).length > 0
          );

          selected = selected.map((specialty: SpecialtyDTO) => {
            let itemToReturn = specialty;
            this.specialtiesList.find((sg: SpecialtiesGroupedByDepartment) =>
              sg.specialties.find((d: SpecialtyDTO) => {
                if (d.id === specialty.id) {
                  itemToReturn = d;
                  return true;
                }
                return false;
              })
            );
            return itemToReturn;
          });
          this.form.get('specialties').setValue(selected);
          if (init) {
            this.setDefaultValueAfterInit.emit(this.form.value);
          }
        },
        error: (error) => {
          this.logger.error(error);
        }
      });
  }

  private getListOptions(): void {
    this.facilitiesAsyncList = this.facilitySevice.getFacilitiesByBrandsIds().pipe(
      tap((facilities: FacilityDTO[]) => {
        this.facilitiesList = facilities;
        if (this.form.get('facilities').value?.length) {
          //Se había inicializado el formulario con datos
          this.form
            .get('facilities')
            .setValue(
              this.form
                .get('facilities')
                .value.map((facilityDefault: BrandDTO) => facilities.find((facility) => facility.id === facilityDefault.id))
            );
          if (this.levelsToShow.departments) {
            this.getDepartmentsOptions(true);
          }
          if (this.levelsToShow.brands) {
            this.getBrandsOptions(true);
          }
        }
      })
    );
    this.brandsList = [];
    this.departmentsList = [];
    this.specialtiesList = [];
  }
}
