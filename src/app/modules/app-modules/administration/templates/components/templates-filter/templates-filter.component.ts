import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Observable, of } from 'rxjs';
import { FilterDrawerClassToExnted } from '@modules/feature-modules/filter-drawer/models/filter-drawer-class-to-extend.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BrandService } from '@data/services/brand.service';
import { DepartmentService } from '@data/services/deparment.service';
import { FacilityService } from '@data/services/facility.sevice';
import { SpecialtyService } from '@data/services/specialty.service';
import { NGXLogger } from 'ngx-logger';
import { FilterDrawerService } from '@modules/feature-modules/filter-drawer/services/filter-drawer.service';
import TemplatesFilterDTO from '@data/models/templates/templates-filter-dto';
// eslint-disable-next-line max-len
import { OrganizationLevelsNestedCombosComponent } from '@modules/feature-modules/organization-levels-nested-combos/organization-levels-nested-combos.component';

@Component({
  selector: 'app-templates-filter',
  templateUrl: './templates-filter.component.html',
  styleUrls: ['./templates-filter.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TemplatesFilterComponent extends FilterDrawerClassToExnted implements OnInit {
  @ViewChild('OrganizationLevelsNestedCombos') organizationLevelsNestedCombos: OrganizationLevelsNestedCombosComponent;
  public filterForm: FormGroup;

  constructor(private fb: FormBuilder, private filterDrawerService: FilterDrawerService) {
    super();
  }

  ngOnInit(): void {
    this.initializeForm();
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
    this.organizationLevelsNestedCombos.getDepartmentsOptions();
    this.organizationLevelsNestedCombos.getBrandsOptions();
    return of(this.filterForm.value);
  }
  public submitFilter(): Observable<TemplatesFilterDTO> {
    return of(this.filterForm.value);
  }
  public isFilterFormTouchedOrDirty(): boolean {
    return this.filterForm?.touched && this.filterForm?.dirty;
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public setDefaultValueAfterInit(data: any): void {
    this.defaultValue = data;
    this.filterDrawerService.filterValueSubject$.next(this.defaultValue);
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
