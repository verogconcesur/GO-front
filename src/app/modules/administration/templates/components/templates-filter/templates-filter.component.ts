import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { FilterDrawerClassToExnted } from '@shared/modules/filter-drawer/models/filter-drawer-class-to-extend.component';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BrandService } from '@data/services/brand.service';
import { DepartmentService } from '@data/services/deparment.service';
import { FacilityService } from '@data/services/facility.sevice';
import { SpecialtyService } from '@data/services/specialty.service';
import { NGXLogger } from 'ngx-logger';
import BrandDTO from '@data/models/brand-dto';
import FacilitiesGroupedByBrand from '@data/interfaces/facilities-grouped-by-brand';
import DepartmentsGroupedByFacility from '@data/interfaces/departments-grouped-by-facility';
import SpecialtiesGroupedByDepartment from '@data/interfaces/specialties-grouped-by-department';
import DepartmentDTO from '@data/models/department-dto';
import FacilityDTO from '@data/models/facility-dto';
import SpecialtyDTO from '@data/models/specialty-dto';
import { take, tap } from 'rxjs/operators';
import { FilterDrawerService } from '@shared/modules/filter-drawer/services/filter-drawer.service';
import TemplatesFilterDTO from '@data/models/templates-filter-dto';

@Component({
  selector: 'app-templates-filter',
  templateUrl: './templates-filter.component.html',
  styleUrls: ['./templates-filter.component.scss']
})
export class TemplatesFilterComponent extends FilterDrawerClassToExnted implements OnInit {
  public labels = {
    brand: marker('userProfile.brand'),
    facility: marker('userProfile.facility'),
    department: marker('userProfile.department'),
    specialty: marker('userProfile.specialty')
  };
  public filterForm: FormGroup;
  public brandsAsyncList: Observable<BrandDTO[]>;
  public facilitiesList: FacilitiesGroupedByBrand[];
  public departmentsList: DepartmentsGroupedByFacility[];
  public specialtiesList: SpecialtiesGroupedByDepartment[];

  constructor(
    private fb: FormBuilder,
    private logger: NGXLogger,
    private brandService: BrandService,
    private facilitySevice: FacilityService,
    private departmentService: DepartmentService,
    private specialtyService: SpecialtyService,
    private filterDrawerService: FilterDrawerService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializeForm();
    this.getListOptions();
  }

  public resetFilter(value?: TemplatesFilterDTO): Observable<TemplatesFilterDTO> {
    this.filterForm.reset();
    if (value) {
      this.filterForm.setValue({
        brands: value.brands,
        facilities: value.facilities,
        departments: value.departments,
        specialties: value.specialties
      });
    } else {
      this.filterForm.get('brands').setValue([]);
      this.filterForm.get('facilities').setValue([]);
      this.filterForm.get('departments').setValue([]);
      this.filterForm.get('specialties').setValue([]);
    }
    this.getFacilitiesOptions();
    return of(this.filterForm.value);
  }
  public submitFilter(): Observable<TemplatesFilterDTO> {
    return of(this.filterForm.value);
  }
  public isFilterFormTouchedOrDirty(): boolean {
    return this.filterForm?.touched || this.filterForm?.dirty;
  }
  public isFilterFormValid(): boolean {
    return this.filterForm?.valid;
  }
  public getFilterFormValue(): TemplatesFilterDTO {
    return this.filterForm?.value;
  }

  get form() {
    return this.filterForm.controls;
  }
  public getFacilitiesOptions(init?: boolean): void {
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
          if (init) {
            //Usado cuando los filtros se setean empleando la navegación que sólo le pasa el id del elemento
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
          }
          this.filterForm.get('facilities').setValue(selected);
          this.getDepartmentsOptions(init);
        },
        error: (error) => {
          this.logger.error(error);
        }
      });
  }

  public getDepartmentsOptions(init?: boolean): void {
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
          if (init) {
            //Usado cuando los filtros se setean empleando la navegación que sólo le pasa el id del elemento
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
          }
          this.filterForm.get('departments').setValue(selected);
          this.getSpecialtiesOptions(init);
        },
        error: (error) => {
          this.logger.error(error);
        }
      });
  }

  public getSpecialtiesOptions(init?: boolean): void {
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
          if (init) {
            this.defaultValue = this.filterForm.value;
            this.filterDrawerService.filterValueSubject$.next(this.defaultValue);
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
        if (this.filterForm.get('brands').value.length) {
          //Se había inicializado el formulario con datos
          this.filterForm
            .get('brands')
            .setValue(
              this.filterForm
                .get('brands')
                .value.map((brandDefault: BrandDTO) => brands.find((brand) => brand.id === brandDefault.id))
            );
          this.getFacilitiesOptions(true);
        }
      })
    );
    this.facilitiesList = [];
    this.departmentsList = [];
    this.specialtiesList = [];
  }

  private initializeForm(): void {
    this.filterForm = this.fb.group({
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
}
