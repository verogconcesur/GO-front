import { Component, Input } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import DepartmentsGroupedByFacility from '@data/interfaces/departments-grouped-by-facility';
import SpecialtiesGroupedByDepartment from '@data/interfaces/specialties-grouped-by-department';
import BrandDTO from '@data/models/organization/brand-dto';
import DepartmentDTO from '@data/models/organization/department-dto';
import FacilityDTO from '@data/models/organization/facility-dto';
import SpecialtyDTO from '@data/models/organization/specialty-dto';
import WorkflowOrganizationDTO from '@data/models/workflow-admin/workflow-organization-dto';
import { BrandService } from '@data/services/brand.service';
import { DepartmentService } from '@data/services/deparment.service';
import { FacilityService } from '@data/services/facility.sevice';
import { SpecialtyService } from '@data/services/specialty.service';
import { WorkflowAdministrationService } from '@data/services/workflow-administration.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { NGXLogger } from 'ngx-logger';
import { finalize, take } from 'rxjs/operators';
import { WorkflowsCreateEditAuxService } from '../../../aux-service/workflows-create-edit-aux.service';
import { WorkflowStepAbstractClass } from '../workflow-step-abstract-class';
@UntilDestroy()
@Component({
  selector: 'app-workflow-organization',
  templateUrl: './workflow-organization.component.html',
  styleUrls: ['./workflow-organization.component.scss']
})
export class WorkflowOrganizationComponent extends WorkflowStepAbstractClass {
  @Input() workflowId: number;
  @Input() stepIndex: number;
  public labels = {
    facilities: marker('workflows.selectFacilities'),
    brands: marker('workflows.selectBrands'),
    departments: marker('workflows.selectDepartments'),
    specialties: marker('workflows.selectSpecialties')
  };
  public organizationData: WorkflowOrganizationDTO;
  public facilitiesList: FacilityDTO[] = [];
  public brandsList: BrandDTO[] = [];
  public departmentsList: DepartmentsGroupedByFacility[];
  public specialtiesList: SpecialtiesGroupedByDepartment[];
  constructor(
    private fb: UntypedFormBuilder,
    public workflowsCreateEditAuxService: WorkflowsCreateEditAuxService,
    public confirmationDialog: ConfirmDialogService,
    public translateService: TranslateService,
    private spinnerService: ProgressSpinnerDialogService,
    public workflowService: WorkflowAdministrationService,
    private facilitySevice: FacilityService,
    private brandService: BrandService,
    private departmentService: DepartmentService,
    private specialtyService: SpecialtyService,
    private globalMessageService: GlobalMessageService,
    private logger: NGXLogger
  ) {
    super(workflowsCreateEditAuxService, confirmationDialog, translateService);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public initForm(data: any): void {
    this.form = this.fb.group({
      id: [data?.id],
      facilities: [data?.facilities, [Validators.required]],
      brands: [data?.brands],
      departments: [data?.departments],
      specialties: [data?.specialties]
    });
    this.workflowsCreateEditAuxService.resetForm$.pipe(untilDestroyed(this)).subscribe(() => {
      this.getOptionsAfterSelection('facilities');
    });
  }

  public selectItem(
    type: 'facilities' | 'brands' | 'departments' | 'specialties',
    item: FacilityDTO | BrandDTO | DepartmentDTO | SpecialtyDTO
  ): void {
    switch (type) {
      case 'facilities':
        const listFacilities = this.form.get('facilities').value ? this.form.get('facilities').value : [];
        if (this.isItemSelected(type, item)) {
          this.form.get('facilities').setValue(listFacilities.filter((facility: FacilityDTO) => facility.id !== item.id));
        } else {
          listFacilities.push(item);
          this.form.get('facilities').setValue(listFacilities);
        }
        this.getOptionsAfterSelection(type);
        break;
      case 'brands':
        const listBrands = this.form.get('brands').value ? this.form.get('brands').value : [];
        if (this.isItemSelected(type, item)) {
          this.form.get('brands').setValue(listBrands.filter((brand: BrandDTO) => brand.id !== item.id));
        } else {
          listBrands.push(item);
          this.form.get('brands').setValue(listBrands);
        }
        break;
      case 'departments':
        const listDepartments = this.form.get('departments').value ? this.form.get('departments').value : [];
        if (this.isItemSelected(type, item)) {
          this.form.get('departments').setValue(listDepartments.filter((department: FacilityDTO) => department.id !== item.id));
        } else {
          listDepartments.push(item);
          this.form.get('departments').setValue(listDepartments);
        }
        this.getOptionsAfterSelection(type);
        break;
      case 'specialties':
        const listSpecialties = this.form.get('specialties').value ? this.form.get('specialties').value : [];
        if (this.isItemSelected(type, item)) {
          this.form.get('specialties').setValue(listSpecialties.filter((specialty: FacilityDTO) => specialty.id !== item.id));
        } else {
          listSpecialties.push(item);
          this.form.get('specialties').setValue(listSpecialties);
        }
        break;
    }
    this.form.markAsTouched();
    this.form.markAsDirty();
  }
  public isItemSelected(
    type: 'facilities' | 'brands' | 'departments' | 'specialties',
    item: FacilityDTO | BrandDTO | DepartmentDTO | SpecialtyDTO
  ): boolean {
    switch (type) {
      case 'facilities':
        const listFacilities = this.form.get('facilities').value;
        return listFacilities && listFacilities.find((facility: FacilityDTO) => facility.id === item.id);
      case 'brands':
        const listBrands = this.form.get('brands').value;
        return listBrands && listBrands.find((brand: BrandDTO) => brand.id === item.id);
      case 'departments':
        const listDepartments = this.form.get('departments').value;
        return listDepartments && listDepartments.find((department: FacilityDTO) => department.id === item.id);
      case 'specialties':
        const listSpecialties = this.form.get('specialties').value;
        return listSpecialties && listSpecialties.find((specialty: FacilityDTO) => specialty.id === item.id);
    }
  }
  public getOptionsAfterSelection(type: 'facilities' | 'departments') {
    switch (type) {
      case 'facilities':
        this.getDepartmentsOptions();
        this.getBrandsOptions();
        break;
      case 'departments':
        this.getSpecialtiesOptions();
        break;
    }
  }
  public async getWorkflowStepData(): Promise<boolean> {
    const spinner = this.spinnerService.show();
    this.facilitiesList = [];
    this.brandsList = [];
    this.departmentsList = [];
    this.specialtiesList = [];
    return new Promise((resolve, reject) => {
      this.workflowService
        .getWorkflowOrganization(this.workflowId)
        .pipe(take(1))
        .subscribe((res) => {
          this.originalData = res;
          this.getFacilityOptions();
          this.spinnerService.hide(spinner);
          resolve(true);
        });
    });
  }
  public getFacilityOptions(): void {
    this.facilitySevice
      .getFacilitiesByBrandsIds()
      .pipe(take(1))
      .subscribe((facilities: FacilityDTO[]) => {
        this.facilitiesList = facilities;
        this.getDepartmentsOptions();
        this.getBrandsOptions();
      });
  }
  public getBrandsOptions(): void {
    if (this.form.get('facilities').value && this.form.get('facilities').value.length) {
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
                      .value.filter((brandSelec: BrandDTO) => response.find((brand) => brandSelec.id === brand.id))
                  : null
              );
          },
          error: (error) => {
            this.globalMessageService.showError({
              message: error.message,
              actionText: this.translateService.instant(marker('common.close'))
            });
          }
        });
    } else {
      this.form.get('brands').setValue([]);
      this.brandsList = [];
    }
  }

  public getDepartmentsOptions(): void {
    if (this.form.get('facilities').value && this.form.get('facilities').value.length) {
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
              this.departmentsList.forEach((dg: DepartmentsGroupedByFacility) =>
                dg.departments.forEach((d: DepartmentDTO) => {
                  if (d.id === department.id) {
                    itemToReturn = d;
                  }
                })
              );
              return itemToReturn;
            });
            this.form.get('departments').setValue(selected);
            this.getSpecialtiesOptions();
          },
          error: (error) => {
            this.globalMessageService.showError({
              message: error.message,
              actionText: this.translateService.instant(marker('common.close'))
            });
          }
        });
    } else {
      this.form.get('departments').setValue([]);
      this.form.get('specialties').setValue([]);
      this.departmentsList = [];
      this.specialtiesList = [];
    }
  }

  public getSpecialtiesOptions(): void {
    if (this.form.get('departments').value && this.form.get('departments').value.length) {
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
              this.specialtiesList.forEach((sg: SpecialtiesGroupedByDepartment) =>
                sg.specialties.forEach((d: SpecialtyDTO) => {
                  if (d.id === specialty.id) {
                    itemToReturn = d;
                  }
                })
              );
              return itemToReturn;
            });
            this.form.get('specialties').setValue(selected);
          },
          error: (error) => {
            this.globalMessageService.showError({
              message: error.message,
              actionText: this.translateService.instant(marker('common.close'))
            });
          }
        });
    } else {
      this.form.get('specialties').setValue([]);
      this.specialtiesList = [];
    }
  }

  public async saveStep(): Promise<boolean> {
    const spinner = this.spinnerService.show();
    return new Promise((resolve, reject) => {
      this.workflowService
        .postWorkflowOrganization(this.workflowId, this.form.getRawValue())
        .pipe(
          take(1),
          finalize(() => {
            this.spinnerService.hide(spinner);
            resolve(true);
          })
        )
        .subscribe({
          next: () => {},
          error: (error: ConcenetError) => {
            this.globalMessageService.showError({
              message: error.message,
              actionText: this.translateService.instant(marker('common.close'))
            });
            resolve(false);
          }
        });
    });
  }
}
