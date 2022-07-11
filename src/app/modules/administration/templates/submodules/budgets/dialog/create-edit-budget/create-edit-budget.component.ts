/* eslint-disable @typescript-eslint/no-explicit-any */
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import DepartmentsGroupedByFacility from '@data/interfaces/departments-grouped-by-facility';
import FacilitiesGroupedByBrand from '@data/interfaces/facilities-grouped-by-brand';
import SpecialtiesGroupedByDepartment from '@data/interfaces/specialties-grouped-by-department';
import BrandDTO from '@data/models/brand-dto';
import DepartmentDTO from '@data/models/department-dto';
import FacilityDTO from '@data/models/facility-dto';
import SpecialtyDTO from '@data/models/specialty-dto';
import TemplatesBudgetDetailsDTO, { TemplateBudgetLinesDTO } from '@data/models/templates-budget-details-dto';
import { BrandService } from '@data/services/brand.service';
import { DepartmentService } from '@data/services/deparment.service';
import { FacilityService } from '@data/services/facility.sevice';
import { SpecialtyService } from '@data/services/specialty.service';
import { TemplatesBudgetsService } from '@data/services/templates-budgets.service';
import { ComponentToExtendForCustomDialog, CustomDialogFooterConfigI, CustomDialogService } from '@jenga/custom-dialog';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { haveArraysSameValues } from '@shared/utils/array-comparation-function';
import { NGXLogger } from 'ngx-logger';
import { Observable, of } from 'rxjs';
import { catchError, finalize, map, take, tap } from 'rxjs/operators';

export const enum CreateEditBudgetComponentModalEnum {
  ID = 'create-edit-budget-dialog-id',
  PANEL_CLASS = 'create-edit-budget-dialog',
  TITLE = 'administration.templates.budgets.add'
}

@Component({
  selector: 'app-create-edit-budget',
  templateUrl: './create-edit-budget.component.html',
  styleUrls: ['./create-edit-budget.component.scss']
})
export class CreateEditBudgetComponent extends ComponentToExtendForCustomDialog implements OnInit, OnDestroy {
  public labels = {
    title: marker('administration.templates.budgets.add'),
    name: marker('administration.templates.budgets.name'),
    organization: marker('userProfile.organization'),
    edit: marker('administration.templates.budgets.edit'),
    data: marker('userProfile.data'),
    brand: marker('userProfile.brand'),
    facility: marker('userProfile.facility'),
    department: marker('userProfile.department'),
    specialty: marker('userProfile.specialty'),
    nameRequired: marker('userProfile.nameRequired'),
    required: marker('errors.required'),
    selectAll: marker('users.roles.selectAll'),
    unselectAll: marker('common.unselectAll'),
    budgetsLines: marker('administration.templates.budgets.lines'),
    newLine: marker('common.newLine'),
    lineConcept: marker('administration.templates.budgets.lineConcept'),
    iniDate: marker('common.dateIni'),
    endDate: marker('common.dateEnd')
  };
  public budgetForm: FormGroup;
  public brandsAsyncList: Observable<BrandDTO[]>;
  public brandsList: BrandDTO[] = [];
  public facilitiesList: FacilitiesGroupedByBrand[] = [];
  public departmentsList: DepartmentsGroupedByFacility[] = [];
  public specialtiesList: SpecialtiesGroupedByDepartment[] = [];
  public budgetToEdit: TemplatesBudgetDetailsDTO = null;
  public startDate: Date;
  public endDate: Date;
  constructor(
    private fb: FormBuilder,
    private spinnerService: ProgressSpinnerDialogService,
    private confirmDialogService: ConfirmDialogService,
    private translateService: TranslateService,
    private budgetService: TemplatesBudgetsService,
    private globalMessageService: GlobalMessageService,
    private logger: NGXLogger,
    private brandService: BrandService,
    private facilitySevice: FacilityService,
    private departmentService: DepartmentService,
    private specialtyService: SpecialtyService,
    private customDialogService: CustomDialogService
  ) {
    super(
      CreateEditBudgetComponentModalEnum.ID,
      CreateEditBudgetComponentModalEnum.PANEL_CLASS,
      CreateEditBudgetComponentModalEnum.TITLE
    );
  }

  ngOnInit(): void {
    this.budgetToEdit = this.extendedComponentData;
    if (this.budgetToEdit) {
      this.MODAL_TITLE = marker('administration.templates.budgets.edit');
    }
    this.initializeForm();
    this.getListOptions();
  }

  ngOnDestroy(): void {
    this.facilitySevice.resetFacilitiesData();
    this.departmentService.resetDepartmentsData();
    this.specialtyService.resetSpecialtiesData();
  }

  public confirmCloseCustomDialog(): Observable<boolean> {
    if (this.budgetForm.touched && this.budgetForm.dirty) {
      return this.confirmDialogService.open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('common.unsavedChangesExit'))
      });
    } else {
      return of(true);
    }
  }

  public dateChange($event: any) {
    console.log($event);
  }

  public onSubmitCustomDialog(): Observable<boolean | TemplatesBudgetDetailsDTO> {
    const formValue = this.budgetForm.value;
    if (this.budgetToEdit) {
      formValue.id = this.budgetToEdit.id;
    }
    const spinner = this.spinnerService.show();
    return this.budgetService.addOrEditBudget(formValue).pipe(
      map((response) => {
        this.globalMessageService.showSuccess({
          message: this.translateService.instant(marker('common.successOperation')),
          actionText: this.translateService.instant(marker('common.close'))
        });
        return response;
      }),
      catchError((error) => {
        this.globalMessageService.showError({
          message: error.message,
          actionText: this.translateService.instant(marker('common.close'))
        });
        return of(false);
      }),
      finalize(() => {
        this.spinnerService.hide(spinner);
      })
    );
  }

  public setAndGetFooterConfig(): CustomDialogFooterConfigI | null {
    return {
      show: true,
      leftSideButtons: [
        {
          type: 'custom',
          label: marker('administration.templates.budgets.delete'),
          design: 'stroked',
          color: 'warn',
          clickFn: this.deleteBudget,
          hiddenFn: () => !this.budgetToEdit
        }
      ],
      rightSideButtons: [
        {
          type: 'submit',
          label: marker('common.save'),
          design: 'raised',
          color: 'primary',
          //TODO: tener en cuenta templateBudgetLines
          disabledFn: () => !(this.budgetForm.touched && this.budgetForm.dirty && this.budgetForm.valid)
        }
      ]
    };
  }

  get templateBudgetLines() {
    return this.budgetForm.controls.templateBudgetLines as FormArray;
  }

  public dropBudgetLine(event: CdkDragDrop<TemplateBudgetLinesDTO[]>) {
    const list = this.templateBudgetLines.value;
    moveItemInArray(list, event.previousIndex, event.currentIndex);
    list.map((item: TemplateBudgetLinesDTO, index: number) => {
      item.orderNumber = index;
      return item;
    });
    this.templateBudgetLines.setValue(list);
  }

  public addBudgetLine() {
    const budgetLine = this.fb.group({
      amount: [0],
      description: ['', Validators.required],
      id: [null],
      orderNumber: [this.templateBudgetLines.length]
    });
    this.templateBudgetLines.push(budgetLine);
  }

  public deleteBudgetLine(index: number) {
    this.templateBudgetLines.removeAt(index);
    const list = this.templateBudgetLines.value;
    list.map((item: TemplateBudgetLinesDTO, i: number) => {
      item.orderNumber = i;
      return item;
    });
    this.templateBudgetLines.setValue(list);
  }

  // Convenience getter for easy access to form fields
  get form() {
    return this.budgetForm.controls;
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
        this.getFacilitiesOptions();
        break;
      case 'facilities':
        this.getDepartmentsOptions();
        break;
      case 'departments':
        this.getSpecialtiesOptions();
        break;
    }
  }

  public getFacilitiesOptions(initialLoad = false): void {
    this.facilitySevice
      .getFacilitiesOptionsListByBrands(this.budgetForm.get('template.brands').value)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.facilitiesList = response;
          if (this.budgetToEdit && initialLoad) {
            this.budgetForm.get('template.facilities').setValue(
              this.budgetForm.get('template.facilities').value.map((f: FacilityDTO) => {
                let facToReturn = f;
                response.forEach((group: FacilitiesGroupedByBrand) => {
                  const found = group.facilities.find((fac: FacilityDTO) => fac.id === f.id);
                  facToReturn = found ? found : facToReturn;
                });
                return facToReturn;
              })
            );
          }
          let selected = this.budgetForm.get('template.facilities').value ? this.budgetForm.get('template.facilities').value : [];
          selected = selected.filter(
            (facility: FacilityDTO) =>
              this.facilitiesList.filter(
                (fg: FacilitiesGroupedByBrand) => fg.facilities.filter((f: FacilityDTO) => f.id === facility.id).length > 0
              ).length > 0
          );
          this.budgetForm.get('template.facilities').setValue(selected);
          this.getDepartmentsOptions(initialLoad);
        },
        error: (error) => {
          this.logger.error(error);
        }
      });
  }

  public getDepartmentsOptions(initialLoad = false): void {
    this.departmentService
      .getDepartmentOptionsListByFacilities(this.budgetForm.get('template.facilities').value)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.departmentsList = response;
          if (this.budgetToEdit && initialLoad) {
            this.budgetForm.get('template.departments').setValue(
              this.budgetForm.get('template.departments').value.map((item: DepartmentDTO) => {
                let itemToReturn = item;
                response.forEach((group: DepartmentsGroupedByFacility) => {
                  const found = group.departments.find((i: DepartmentDTO) => i.id === item.id);
                  itemToReturn = found ? found : itemToReturn;
                });
                return itemToReturn;
              })
            );
          }
          let selected = this.budgetForm.get('template.departments').value
            ? this.budgetForm.get('template.departments').value
            : [];
          selected = selected.filter(
            (department: DepartmentDTO) =>
              this.departmentsList.filter(
                (dg: DepartmentsGroupedByFacility) =>
                  dg.departments.filter((d: DepartmentDTO) => d.id === department.id).length > 0
              ).length > 0
          );
          this.budgetForm.get('template.departments').setValue(selected);
          this.getSpecialtiesOptions(initialLoad);
        },
        error: (error) => {
          this.logger.error(error);
        }
      });
  }

  public getSpecialtiesOptions(initialLoad = false): void {
    this.specialtyService
      .getSpecialtyOptionsListByDepartments(this.budgetForm.get('template.departments').value)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.specialtiesList = response;
          if (this.budgetToEdit && initialLoad) {
            this.budgetForm.get('template.specialties').setValue(
              this.budgetForm.get('template.specialties').value.map((item: SpecialtyDTO) => {
                let itemToReturn = item;
                response.forEach((group: SpecialtiesGroupedByDepartment) => {
                  const found = group.specialties.find((i: SpecialtyDTO) => i.id === item.id);
                  itemToReturn = found ? found : itemToReturn;
                });
                return itemToReturn;
              })
            );
          }
          let selected = this.budgetForm.get('template.specialties').value
            ? this.budgetForm.get('template.specialties').value
            : [];
          selected = selected.filter(
            (specialty: SpecialtyDTO) =>
              this.specialtiesList.filter(
                (sg: SpecialtiesGroupedByDepartment) =>
                  sg.specialties.filter((s: SpecialtyDTO) => s.id === specialty.id).length > 0
              ).length > 0
          );
          this.budgetForm.get('template.specialties').setValue(selected);
        },
        error: (error) => {
          this.logger.error(error);
        }
      });
  }

  private getListOptions(): void {
    this.facilitiesList = [];
    this.departmentsList = [];
    this.specialtiesList = [];
    this.brandsAsyncList = this.brandService.getAllBrands().pipe(
      tap({
        next: (brands: BrandDTO[]) => {
          this.brandsList = brands;
          if (this.budgetToEdit) {
            this.budgetForm
              .get('template.brands')
              .setValue(
                this.budgetForm
                  .get('template.brands')
                  .value.map((b: BrandDTO) => brands.find((brand: BrandDTO) => brand.id === b.id))
              );
            this.getFacilitiesOptions(true);
          }
        }
      })
    );
  }

  private deleteBudget = () => {
    this.confirmDialogService
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('administration.templates.budgets.deleteConfirmation'))
      })
      .subscribe((ok: boolean) => {
        if (ok) {
          this.budgetService
            .deleteBudgetById(this.budgetToEdit.id)
            .pipe(take(1))
            .subscribe({
              next: (response) => {
                this.customDialogService.close(this.MODAL_ID, true);
              },
              error: (error) => {
                this.globalMessageService.showError({
                  message: error.message,
                  actionText: this.translateService.instant(marker('common.close'))
                });
              }
            });
        }
      });
  };

  private initializeForm(): void {
    const budgetLines: FormGroup[] = [];
    if (this.budgetToEdit?.templateBudgetLines?.length > 0) {
      this.budgetToEdit.templateBudgetLines
        .sort((a, b) => a.orderNumber - b.orderNumber)
        .forEach((line) => {
          const budgetLine = this.fb.group({
            amount: [line.amount],
            description: [line.description, Validators.required],
            id: [line.id],
            orderNumber: [line.orderNumber]
          });
          budgetLines.push(budgetLine);
        });
    }
    this.budgetForm = this.fb.group({
      endDate: [this.budgetToEdit ? this.budgetToEdit.endDate : null, Validators.required],
      startDate: [this.budgetToEdit ? this.budgetToEdit.startDate : null, Validators.required],
      templateBudgetLines: this.fb.array(budgetLines, [Validators.required]),
      template: this.fb.group({
        name: [this.budgetToEdit ? this.budgetToEdit.template.name : null, Validators.required],
        brands: [this.budgetToEdit ? this.budgetToEdit.template.brands : null, Validators.required],
        facilities: [this.budgetToEdit ? this.budgetToEdit.template.facilities : null, Validators.required],
        departments: [this.budgetToEdit ? this.budgetToEdit.template.departments : null],
        specialties: [this.budgetToEdit ? this.budgetToEdit.template.specialties : null]
      })
    });
  }
}
