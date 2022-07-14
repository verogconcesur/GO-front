/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import DepartmentsGroupedByFacility from '@data/interfaces/departments-grouped-by-facility';
import FacilitiesGroupedByBrand from '@data/interfaces/facilities-grouped-by-brand';
import SpecialtiesGroupedByDepartment from '@data/interfaces/specialties-grouped-by-department';
import BrandDTO from '@data/models/brand-dto';
import DepartmentDTO from '@data/models/department-dto';
import FacilityDTO from '@data/models/facility-dto';
import SpecialtyDTO from '@data/models/specialty-dto';
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
  @Input() form: FormGroup;
  //Brands is always shown
  @Input() levelsToShow: { specialties: boolean; departments: boolean; facilities: boolean } = {
    specialties: true,
    departments: true,
    facilities: true
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
  public brandsAsyncList: Observable<BrandDTO[]>;
  public brandsList: BrandDTO[] = [];
  public facilitiesList: FacilitiesGroupedByBrand[];
  public departmentsList: DepartmentsGroupedByFacility[];
  public specialtiesList: SpecialtiesGroupedByDepartment[];

  constructor(
    private logger: NGXLogger,
    private brandService: BrandService,
    private facilitySevice: FacilityService,
    private departmentService: DepartmentService,
    private specialtyService: SpecialtyService
  ) {}

  ngOnInit(): void {
    this.getListOptions();
  }

  ngOnDestroy(): void {
    this.facilitySevice.resetFacilitiesData();
    this.departmentService.resetDepartmentsData();
    this.specialtyService.resetSpecialtiesData();
  }

  get formControls() {
    return this.form.controls;
  }

  public selectAll(type: 'specialties' | 'departments' | 'facilities' | 'brands', control: AbstractControl, list: any[]) {
    if (type === 'brands') {
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
    if (type !== 'brands') {
      list = list.reduce((prev, act) => [...prev, ...act[type]], []);
    }
    const actualValue = control.value ? control.value : [];
    return haveArraysSameValues(actualValue.map((item: any) => item.id).sort(), list.map((item: any) => item.id).sort());
  }

  public getOptionsAfterSelection(type: 'specialties' | 'departments' | 'facilities' | 'brands') {
    switch (type) {
      case 'brands':
        if (this.levelsToShow.facilities) {
          this.getFacilitiesOptions();
        }
        break;
      case 'facilities':
        if (this.levelsToShow.departments) {
          this.getDepartmentsOptions();
        }
        break;
      case 'departments':
        if (this.levelsToShow.specialties) {
          this.getSpecialtiesOptions();
        }
        break;
    }
  }

  public getFacilitiesOptions(init?: boolean): void {
    this.facilitySevice
      .getFacilitiesOptionsListByBrands(this.form.get('brands').value)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.facilitiesList = response;
          let selected = this.form.get('facilities').value ? this.form.get('facilities').value : [];
          selected = selected.filter(
            (facility: FacilityDTO) =>
              this.facilitiesList.filter(
                (fg: FacilitiesGroupedByBrand) => fg.facilities.filter((f: FacilityDTO) => f.id === facility.id).length > 0
              ).length > 0
          );

          selected = selected.map((facility: FacilityDTO) => {
            let itemToReturn = facility;
            this.facilitiesList.find((fg: FacilitiesGroupedByBrand) =>
              fg.facilities.find((f: FacilityDTO) => {
                if (f.id === facility.id) {
                  itemToReturn = f;
                  return true;
                }
                return false;
              })
            );
            return itemToReturn;
          });
          this.form.get('facilities').setValue(selected);
          if (this.levelsToShow.departments) {
            this.getDepartmentsOptions(init);
          }
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
    this.brandsAsyncList = this.brandService.getAllBrands().pipe(
      tap((brands: BrandDTO[]) => {
        this.brandsList = brands;
        if (this.form.get('brands').value?.length) {
          //Se había inicializado el formulario con datos
          this.form
            .get('brands')
            .setValue(
              this.form.get('brands').value.map((brandDefault: BrandDTO) => brands.find((brand) => brand.id === brandDefault.id))
            );
          if (this.levelsToShow.facilities) {
            this.getFacilitiesOptions(true);
          }
        }
      })
    );
    this.facilitiesList = [];
    this.departmentsList = [];
    this.specialtiesList = [];
  }
}
