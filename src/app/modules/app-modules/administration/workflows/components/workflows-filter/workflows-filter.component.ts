/* eslint-disable max-len */
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { WorkflowSearchFilterDTO } from '@data/models/workflows/workflow-filter-dto';
import { FilterDrawerClassToExnted } from '@modules/feature-modules/filter-drawer/models/filter-drawer-class-to-extend.component';
import { FilterDrawerService } from '@modules/feature-modules/filter-drawer/services/filter-drawer.service';
import { OrganizationLevelsNestedCombosComponent } from '@modules/feature-modules/organization-levels-nested-combos/organization-levels-nested-combos.component';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Observable, of } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'app-workflows-filter',
  templateUrl: './workflows-filter.component.html',
  styleUrls: ['./workflows-filter.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class WorkflowsFilterComponent extends FilterDrawerClassToExnted implements OnInit {
  @ViewChild('OrganizationLevelsNestedCombos') organizationLevelsNestedCombos: OrganizationLevelsNestedCombosComponent;
  public labels = {
    brand: marker('userProfile.brand'),
    facility: marker('userProfile.facility'),
    department: marker('userProfile.department'),
    specialty: marker('userProfile.specialty'),
    status: marker('common.state')
  };
  public filterForm: UntypedFormGroup;
  public statusList: { value: string; label: string }[] = [];

  constructor(private fb: UntypedFormBuilder, private filterDrawerService: FilterDrawerService) {
    super();
  }

  get form() {
    return this.filterForm.controls;
  }

  ngOnInit(): void {
    this.initializeForm();
    this.getListOptions();
  }

  public resetFilter(value?: WorkflowSearchFilterDTO): Observable<WorkflowSearchFilterDTO> {
    this.filterForm.reset();
    if (value) {
      this.filterForm.setValue({
        brands: value.brands,
        facilities: value.facilities,
        departments: value.departments,
        specialties: value.specialties,
        status: value.status
      });
    } else {
      this.filterForm.get('brands').setValue([]);
      this.filterForm.get('facilities').setValue([]);
      this.filterForm.get('departments').setValue([]);
      this.filterForm.get('specialties').setValue([]);
      this.filterForm.get('status').setValue(null);
    }
    this.organizationLevelsNestedCombos.getDepartmentsOptions();
    this.organizationLevelsNestedCombos.getBrandsOptions();
    return of(this.filterForm.value);
  }
  public submitFilter(): Observable<WorkflowSearchFilterDTO> {
    return of(this.filterForm.value);
  }
  public isFilterFormTouchedOrDirty(): boolean {
    return this.filterForm?.dirty;
  }
  public isFilterFormValid(): boolean {
    return this.filterForm?.valid;
  }
  public getFilterFormValue(): WorkflowSearchFilterDTO {
    return this.filterForm?.value;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public setDefaultValueAfterInit(data: any): void {
    this.defaultValue = data;
    this.filterDrawerService.filterValueSubject$.next({
      brands: this.defaultValue?.brands ? this.defaultValue.brands : [],
      departments: this.defaultValue?.departments ? this.defaultValue.departments : [],
      facilities: this.defaultValue?.facilities ? this.defaultValue.facilities : [],
      specialties: this.defaultValue?.specialties ? this.defaultValue.specialties : [],
      status: this.defaultValue?.status ? this.defaultValue.status : null
    });
  }

  private getListOptions(): void {
    this.statusList = [
      { value: 'DRAFT', label: marker('workflows.draft') },
      { value: 'PUBLISHED', label: marker('workflows.published') }
    ];
  }

  private initializeForm(): void {
    this.filterForm = this.fb.group({
      brands: [[]],
      facilities: [[]],
      departments: [[]],
      specialties: [[]],
      status: [null]
    });
    ['brands', 'facilities', 'departments', 'specialties', 'status'].forEach((k) => {
      if (this.defaultValue && this.defaultValue[k] && this.defaultValue[k].length) {
        this.filterForm.get(k).setValue(this.defaultValue[k]);
      }
    });
  }
}
