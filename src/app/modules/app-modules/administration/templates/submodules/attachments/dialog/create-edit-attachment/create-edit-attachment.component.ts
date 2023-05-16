/* eslint-disable @typescript-eslint/no-explicit-any */
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import DepartmentsGroupedByFacility from '@data/interfaces/departments-grouped-by-facility';
import FacilitiesGroupedByBrand from '@data/interfaces/facilities-grouped-by-brand';
import SpecialtiesGroupedByDepartment from '@data/interfaces/specialties-grouped-by-department';
import BrandDTO from '@data/models/organization/brand-dto';
import DepartmentDTO from '@data/models/organization/department-dto';
import FacilityDTO from '@data/models/organization/facility-dto';
import SpecialtyDTO from '@data/models/organization/specialty-dto';
import TemplatesAttachmentDTO, { TemplateAtachmentItemsDTO } from '@data/models/templates/templates-attachment-dto';
import { BrandService } from '@data/services/brand.service';
import { DepartmentService } from '@data/services/deparment.service';
import { FacilityService } from '@data/services/facility.sevice';
import { SpecialtyService } from '@data/services/specialty.service';
import { TemplatesAttachmentService } from '@data/services/templates-attachment.service';
import { ComponentToExtendForCustomDialog, CustomDialogFooterConfigI, CustomDialogService } from '@jenga/custom-dialog';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { haveArraysSameValues } from '@shared/utils/array-comparation-function';
import { NGXLogger } from 'ngx-logger';
import { Observable, of } from 'rxjs';
import { catchError, finalize, map, take, tap } from 'rxjs/operators';

export const enum CreateEditAttachmentComponentModalEnum {
  ID = 'create-edit-attachment-dialog-id',
  PANEL_CLASS = 'create-edit-attachment-dialog',
  TITLE = 'administration.templates.attachments.add'
}

@Component({
  selector: 'app-create-edit-attachment',
  templateUrl: './create-edit-attachment.component.html',
  styleUrls: ['./create-edit-attachment.component.scss']
})
export class CreateEditAttachmentComponent extends ComponentToExtendForCustomDialog implements OnInit, OnDestroy {
  public labels = {
    title: marker('administration.templates.attachments.add'),
    name: marker('administration.templates.attachments.name'),
    organization: marker('userProfile.organization'),
    edit: marker('administration.templates.attachments.edit'),
    data: marker('userProfile.data'),
    brand: marker('userProfile.brand'),
    facility: marker('userProfile.facility'),
    department: marker('userProfile.department'),
    specialty: marker('userProfile.specialty'),
    nameRequired: marker('userProfile.nameRequired'),
    required: marker('errors.required'),
    selectAll: marker('users.roles.selectAll'),
    unselectAll: marker('common.unselectAll'),
    attachmentsItems: marker('administration.templates.attachments.items'),
    newItem: marker('common.newItem'),
    itemConcept: marker('administration.templates.attachments.itemConcept'),
    iniDate: marker('common.dateIni'),
    endDate: marker('common.dateEnd')
  };
  public attachmentForm: UntypedFormGroup;
  public brandsAsyncList: Observable<BrandDTO[]>;
  public brandsList: BrandDTO[] = [];
  public facilitiesList: FacilitiesGroupedByBrand[] = [];
  public departmentsList: DepartmentsGroupedByFacility[] = [];
  public specialtiesList: SpecialtiesGroupedByDepartment[] = [];
  public attachmentToEdit: TemplatesAttachmentDTO = null;
  public startDate: Date;
  public endDate: Date;
  constructor(
    private fb: UntypedFormBuilder,
    private spinnerService: ProgressSpinnerDialogService,
    private confirmDialogService: ConfirmDialogService,
    private translateService: TranslateService,
    private attachmentService: TemplatesAttachmentService,
    private globalMessageService: GlobalMessageService,
    private logger: NGXLogger,
    private brandService: BrandService,
    private facilitySevice: FacilityService,
    private departmentService: DepartmentService,
    private specialtyService: SpecialtyService,
    private customDialogService: CustomDialogService
  ) {
    super(
      CreateEditAttachmentComponentModalEnum.ID,
      CreateEditAttachmentComponentModalEnum.PANEL_CLASS,
      CreateEditAttachmentComponentModalEnum.TITLE
    );
  }

  get templateAttachmentItems() {
    return this.attachmentForm.controls.templateAttachmentItems as UntypedFormArray;
  }
  // Convenience getter for easy access to form fields
  get form() {
    return this.attachmentForm.controls;
  }

  ngOnInit(): void {
    this.attachmentToEdit = this.extendedComponentData;
    if (this.attachmentToEdit) {
      this.MODAL_TITLE = marker('administration.templates.attachments.edit');
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
    if (this.attachmentForm.touched && this.attachmentForm.dirty) {
      return this.confirmDialogService.open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('common.unsavedChangesExit'))
      });
    } else {
      return of(true);
    }
  }

  public onSubmitCustomDialog(): Observable<boolean | TemplatesAttachmentDTO> {
    const formValue = this.attachmentForm.value;
    if (this.attachmentToEdit) {
      formValue.id = this.attachmentToEdit.id;
      formValue.template.id = this.attachmentToEdit.template.id;
    }
    const spinner = this.spinnerService.show();
    return this.attachmentService.addOrEditAttachment(formValue).pipe(
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
          label: marker('administration.templates.attachments.delete'),
          design: 'stroked',
          color: 'warn',
          clickFn: this.deleteAttachment,
          hiddenFn: () => !this.attachmentToEdit
        }
      ],
      rightSideButtons: [
        {
          type: 'submit',
          label: marker('common.save'),
          design: 'raised',
          color: 'primary',
          //TODO: tener en cuenta templateAttachmentItems
          disabledFn: () => !(this.attachmentForm.touched && this.attachmentForm.dirty && this.attachmentForm.valid)
        }
      ]
    };
  }

  public dropAttachmentItem(event: CdkDragDrop<TemplateAtachmentItemsDTO[]>) {
    const list = this.templateAttachmentItems.value;
    moveItemInArray(list, event.previousIndex, event.currentIndex);
    list.map((item: TemplateAtachmentItemsDTO, index: number) => {
      item.orderNumber = index;
      return item;
    });
    this.templateAttachmentItems.setValue(list);
    this.attachmentForm.get('templateAttachmentItems').markAsDirty();
    this.attachmentForm.get('templateAttachmentItems').markAsTouched();
  }

  public addAttachmentItem() {
    const attachmentItem = this.fb.group({
      name: ['', Validators.required],
      id: [null],
      orderNumber: [this.templateAttachmentItems.length]
    });
    this.templateAttachmentItems.push(attachmentItem);
  }

  public deleteAttachmentItem(index: number) {
    this.templateAttachmentItems.removeAt(index);
    const list = this.templateAttachmentItems.value;
    list.map((item: TemplateAtachmentItemsDTO, i: number) => {
      item.orderNumber = i;
      return item;
    });
    this.templateAttachmentItems.setValue(list);
    this.attachmentForm.get('templateAttachmentItems').markAsDirty();
    this.attachmentForm.get('templateAttachmentItems').markAsTouched();
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
    return haveArraysSameValues(
      actualValue.map((item: any) => (item?.id ? item.id : null)).sort(),
      list.map((item: any) => (item?.id ? item.id : null)).sort()
    );
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
      .getFacilitiesOptionsListByBrands(this.attachmentForm.get('template.brands').value)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.facilitiesList = response;
          if (this.attachmentToEdit && initialLoad) {
            this.attachmentForm.get('template.facilities').setValue(
              this.attachmentForm.get('template.facilities').value.map((f: FacilityDTO) => {
                let facToReturn = f;
                response.forEach((group: FacilitiesGroupedByBrand) => {
                  const found = group.facilities.find((fac: FacilityDTO) => fac.id === f.id);
                  facToReturn = found ? found : facToReturn;
                });
                return facToReturn;
              })
            );
          }
          let selected = this.attachmentForm.get('template.facilities').value
            ? this.attachmentForm.get('template.facilities').value
            : [];
          selected = selected.filter(
            (facility: FacilityDTO) =>
              this.facilitiesList.filter(
                (fg: FacilitiesGroupedByBrand) => fg.facilities.filter((f: FacilityDTO) => f.id === facility.id).length > 0
              ).length > 0
          );
          this.attachmentForm.get('template.facilities').setValue(selected);
          this.getDepartmentsOptions(initialLoad);
        },
        error: (error) => {
          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
        }
      });
  }

  public getDepartmentsOptions(initialLoad = false): void {
    this.departmentService
      .getDepartmentOptionsListByFacilities(this.attachmentForm.get('template.facilities').value)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.departmentsList = response;
          if (this.attachmentToEdit && initialLoad) {
            this.attachmentForm.get('template.departments').setValue(
              this.attachmentForm.get('template.departments').value.map((item: DepartmentDTO) => {
                let itemToReturn = item;
                response.forEach((group: DepartmentsGroupedByFacility) => {
                  const found = group.departments.find((i: DepartmentDTO) => i.id === item.id);
                  itemToReturn = found ? found : itemToReturn;
                });
                return itemToReturn;
              })
            );
          }
          let selected = this.attachmentForm.get('template.departments').value
            ? this.attachmentForm.get('template.departments').value
            : [];
          selected = selected.filter(
            (department: DepartmentDTO) =>
              this.departmentsList.filter(
                (dg: DepartmentsGroupedByFacility) =>
                  dg.departments.filter((d: DepartmentDTO) => d.id === department.id).length > 0
              ).length > 0
          );
          this.attachmentForm.get('template.departments').setValue(selected);
          this.getSpecialtiesOptions(initialLoad);
        },
        error: (error) => {
          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
        }
      });
  }

  public getSpecialtiesOptions(initialLoad = false): void {
    this.specialtyService
      .getSpecialtyOptionsListByDepartments(this.attachmentForm.get('template.departments').value)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.specialtiesList = response;
          if (this.attachmentToEdit && initialLoad) {
            this.attachmentForm.get('template.specialties').setValue(
              this.attachmentForm.get('template.specialties').value.map((item: SpecialtyDTO) => {
                let itemToReturn = item;
                response.forEach((group: SpecialtiesGroupedByDepartment) => {
                  const found = group.specialties.find((i: SpecialtyDTO) => i.id === item.id);
                  itemToReturn = found ? found : itemToReturn;
                });
                return itemToReturn;
              })
            );
          }
          let selected = this.attachmentForm.get('template.specialties').value
            ? this.attachmentForm.get('template.specialties').value
            : [];
          selected = selected.filter(
            (specialty: SpecialtyDTO) =>
              this.specialtiesList.filter(
                (sg: SpecialtiesGroupedByDepartment) =>
                  sg.specialties.filter((s: SpecialtyDTO) => s.id === specialty.id).length > 0
              ).length > 0
          );
          this.attachmentForm.get('template.specialties').setValue(selected);
        },
        error: (error) => {
          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
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
          if (this.attachmentToEdit) {
            this.attachmentForm
              .get('template.brands')
              .setValue(
                this.attachmentForm
                  .get('template.brands')
                  .value.map((b: BrandDTO) => brands.find((brand: BrandDTO) => brand.id === b.id))
              );
            this.getFacilitiesOptions(true);
          }
        }
      })
    );
  }

  private deleteAttachment = () => {
    this.confirmDialogService
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('administration.templates.attachments.deleteConfirmation'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          const spinner = this.spinnerService.show();
          this.attachmentService
            .deleteAttachmentById(this.attachmentToEdit.id)
            .pipe(
              take(1),
              finalize(() => this.spinnerService.hide(spinner))
            )
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
    const attachmentItems: UntypedFormGroup[] = [];
    if (this.attachmentToEdit?.templateAttachmentItems?.length > 0) {
      this.attachmentToEdit.templateAttachmentItems
        .sort((a, b) => a.orderNumber - b.orderNumber)
        .forEach((item) => {
          const attachmentItem = this.fb.group({
            name: [item.name, Validators.required],
            id: [item.id],
            orderNumber: [item.orderNumber]
          });
          attachmentItems.push(attachmentItem);
        });
    }
    this.attachmentForm = this.fb.group({
      templateAttachmentItems: this.fb.array(attachmentItems, [Validators.required]),
      template: this.fb.group({
        name: [this.attachmentToEdit ? this.attachmentToEdit.template.name : null, Validators.required],
        brands: [this.attachmentToEdit ? this.attachmentToEdit.template.brands : null, Validators.required],
        facilities: [this.attachmentToEdit ? this.attachmentToEdit.template.facilities : null, Validators.required],
        departments: [this.attachmentToEdit ? this.attachmentToEdit.template.departments : null, Validators.required],
        specialties: [this.attachmentToEdit ? this.attachmentToEdit.template.specialties : null, Validators.required]
      })
    });
  }
}
