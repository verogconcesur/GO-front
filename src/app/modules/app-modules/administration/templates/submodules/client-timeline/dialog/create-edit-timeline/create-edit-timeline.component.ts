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
import TemplatesTimelineDTO, { TemplatesTimelineItemsDTO } from '@data/models/templates/templates-timeline-dto';
import VariablesDTO from '@data/models/variables-dto';
import { BrandService } from '@data/services/brand.service';
import { DepartmentService } from '@data/services/deparment.service';
import { FacilityService } from '@data/services/facility.sevice';
import { SpecialtyService } from '@data/services/specialty.service';
import { TemplatesTimelineService } from '@data/services/templates-timeline.service';
import { VariablesService } from '@data/services/variables.service';
import { ComponentToExtendForCustomDialog, CustomDialogFooterConfigI, CustomDialogService } from '@jenga/custom-dialog';
// eslint-disable-next-line max-len
import { TextEditorWrapperConfigI } from '@modules/feature-modules/text-editor-wrapper/interfaces/text-editor-wrapper-config.interface';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { haveArraysSameValues } from '@shared/utils/array-comparation-function';
import { NGXLogger } from 'ngx-logger';
import { Observable, of } from 'rxjs';
import { catchError, finalize, map, take, tap } from 'rxjs/operators';

export const enum CreateEditTimelineComponentModalEnum {
  ID = 'create-edit-timelines-dialog-id',
  PANEL_CLASS = 'create-edit-timelines-dialog',
  TITLE = 'administration.templates.clientTimeline.add'
}

@Component({
  selector: 'app-create-edit-timeline',
  templateUrl: './create-edit-timeline.component.html',
  styleUrls: ['./create-edit-timeline.component.scss']
})
export class CreateEditTimelineComponent extends ComponentToExtendForCustomDialog implements OnInit, OnDestroy {
  public labels = {
    title: marker('administration.templates.clientTimeline.add'),
    name: marker('administration.templates.clientTimeline.name'),
    organization: marker('userProfile.organization'),
    edit: marker('administration.templates.clientTimeline.edit'),
    data: marker('userProfile.data'),
    brand: marker('userProfile.brand'),
    facility: marker('userProfile.facility'),
    department: marker('userProfile.department'),
    specialty: marker('userProfile.specialty'),
    nameRequired: marker('userProfile.nameRequired'),
    required: marker('errors.required'),
    selectAll: marker('users.roles.selectAll'),
    unselectAll: marker('common.unselectAll'),
    timelinesItems: marker('administration.templates.clientTimeline.items'),
    newItem: marker('common.newItem'),
    itemConcept: marker('administration.templates.clientTimeline.itemConcept'),
    closed: marker('administration.templates.clientTimeline.closed'),
    insertText: marker('common.insertTextHere'),
    landingMessage: marker('administration.templates.clientTimeline.landingMessage')
  };
  public timelineForm: UntypedFormGroup;
  public brandsAsyncList: Observable<BrandDTO[]>;
  public brandsList: BrandDTO[] = [];
  public facilitiesList: FacilitiesGroupedByBrand[] = [];
  public departmentsList: DepartmentsGroupedByFacility[] = [];
  public specialtiesList: SpecialtiesGroupedByDepartment[] = [];
  public timelineToEdit: TemplatesTimelineDTO = null;
  public startDate: Date;
  public endDate: Date;
  public showingLandingMessageEditor: number;
  public textEditorToolbarOptions: TextEditorWrapperConfigI = {
    addHtmlModificationOption: true,
    addMacroListOption: true,
    macroListOptions: []
  };
  constructor(
    private fb: UntypedFormBuilder,
    private spinnerService: ProgressSpinnerDialogService,
    private confirmDialogService: ConfirmDialogService,
    private translateService: TranslateService,
    private timelineService: TemplatesTimelineService,
    private globalMessageService: GlobalMessageService,
    private logger: NGXLogger,
    private brandService: BrandService,
    private facilitySevice: FacilityService,
    private departmentService: DepartmentService,
    private specialtyService: SpecialtyService,
    private customDialogService: CustomDialogService,
    private variablesService: VariablesService
  ) {
    super(
      CreateEditTimelineComponentModalEnum.ID,
      CreateEditTimelineComponentModalEnum.PANEL_CLASS,
      CreateEditTimelineComponentModalEnum.TITLE
    );
  }

  get templateTimelineItems() {
    return this.timelineForm.controls.templateTimelineItems as UntypedFormArray;
  }
  // Convenience getter for easy access to form fields
  get form() {
    return this.timelineForm.controls;
  }

  ngOnInit(): void {
    this.timelineToEdit = this.extendedComponentData;
    if (this.timelineToEdit) {
      this.MODAL_TITLE = marker('administration.templates.clientTimeline.edit');
    }
    this.getVariable();
    this.initializeForm();
    this.getListOptions();
  }

  ngOnDestroy(): void {
    this.facilitySevice.resetFacilitiesData();
    this.departmentService.resetDepartmentsData();
    this.specialtyService.resetSpecialtiesData();
  }

  public confirmCloseCustomDialog(): Observable<boolean> {
    if (this.timelineForm.touched && this.timelineForm.dirty) {
      return this.confirmDialogService.open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('common.unsavedChangesExit'))
      });
    } else {
      return of(true);
    }
  }

  public onSubmitCustomDialog(): Observable<boolean | TemplatesTimelineDTO> {
    const formValue = this.timelineForm.value;
    if (this.timelineToEdit) {
      formValue.id = this.timelineToEdit.id;
      formValue.template.id = this.timelineToEdit.template.id;
    }
    const spinner = this.spinnerService.show();
    return this.timelineService.addOrEditTimeline(formValue).pipe(
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
          label: marker('administration.templates.clientTimeline.delete'),
          design: 'stroked',
          color: 'warn',
          clickFn: this.deleteTimeline,
          hiddenFn: () => !this.timelineToEdit
        }
      ],
      rightSideButtons: [
        {
          type: 'submit',
          label: marker('common.save'),
          design: 'raised',
          color: 'primary',
          //TODO: tener en cuenta templateTimelineItems
          disabledFn: () => !(this.timelineForm.touched && this.timelineForm.dirty && this.timelineForm.valid)
        }
      ]
    };
  }

  public showLandingMessageEditor(i: number) {
    if (this.showingLandingMessageEditor !== i) {
      this.showingLandingMessageEditor = i;
    } else {
      this.showingLandingMessageEditor = null;
    }
  }

  public textEditorContentChanged(html: string, itemForm: UntypedFormGroup) {
    itemForm.get('messageLanding').setValue(html);
    itemForm.get('messageLanding').markAsDirty();
    itemForm.get('messageLanding').markAsTouched();
  }

  public dropTimelineItem(event: CdkDragDrop<TemplatesTimelineItemsDTO[]>) {
    const list = this.templateTimelineItems.value;
    moveItemInArray(list, event.previousIndex, event.currentIndex);
    list.map((item: TemplatesTimelineItemsDTO, index: number) => {
      item.orderNumber = index;
      return item;
    });
    this.templateTimelineItems.setValue(list);
    this.timelineForm.get('templateTimelineItems').markAsDirty();
    this.timelineForm.get('templateTimelineItems').markAsTouched();
  }

  public addTimelineItem() {
    const timelineItem = this.fb.group({
      name: ['', Validators.required],
      id: [null],
      orderNumber: [this.templateTimelineItems.length]
    });
    this.templateTimelineItems.push(timelineItem);
  }

  public deleteTimelineItem(index: number) {
    this.templateTimelineItems.removeAt(index);
    const list = this.templateTimelineItems.value;
    list.map((item: TemplatesTimelineItemsDTO, i: number) => {
      item.orderNumber = i;
      return item;
    });
    this.templateTimelineItems.setValue(list);
    this.timelineForm.get('templateTimelineItems').markAsDirty();
    this.timelineForm.get('templateTimelineItems').markAsTouched();
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
      .getFacilitiesOptionsListByBrands(this.timelineForm.get('template.brands').value)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.facilitiesList = response;
          if (this.timelineToEdit && initialLoad) {
            this.timelineForm.get('template.facilities').setValue(
              this.timelineForm.get('template.facilities').value.map((f: FacilityDTO) => {
                let facToReturn = f;
                response.forEach((group: FacilitiesGroupedByBrand) => {
                  const found = group.facilities.find((fac: FacilityDTO) => fac.id === f.id);
                  facToReturn = found ? found : facToReturn;
                });
                return facToReturn;
              })
            );
          }
          let selected = this.timelineForm.get('template.facilities').value
            ? this.timelineForm.get('template.facilities').value
            : [];
          selected = selected.filter(
            (facility: FacilityDTO) =>
              this.facilitiesList.filter(
                (fg: FacilitiesGroupedByBrand) => fg.facilities.filter((f: FacilityDTO) => f.id === facility.id).length > 0
              ).length > 0
          );
          this.timelineForm.get('template.facilities').setValue(selected);
          this.getDepartmentsOptions(initialLoad);
        },
        error: (error) => {
          this.logger.error(error);
        }
      });
  }

  public getDepartmentsOptions(initialLoad = false): void {
    this.departmentService
      .getDepartmentOptionsListByFacilities(this.timelineForm.get('template.facilities').value)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.departmentsList = response;
          if (this.timelineToEdit && initialLoad) {
            this.timelineForm.get('template.departments').setValue(
              this.timelineForm.get('template.departments').value.map((item: DepartmentDTO) => {
                let itemToReturn = item;
                response.forEach((group: DepartmentsGroupedByFacility) => {
                  const found = group.departments.find((i: DepartmentDTO) => i.id === item.id);
                  itemToReturn = found ? found : itemToReturn;
                });
                return itemToReturn;
              })
            );
          }
          let selected = this.timelineForm.get('template.departments').value
            ? this.timelineForm.get('template.departments').value
            : [];
          selected = selected.filter(
            (department: DepartmentDTO) =>
              this.departmentsList.filter(
                (dg: DepartmentsGroupedByFacility) =>
                  dg.departments.filter((d: DepartmentDTO) => d.id === department.id).length > 0
              ).length > 0
          );
          this.timelineForm.get('template.departments').setValue(selected);
          this.getSpecialtiesOptions(initialLoad);
        },
        error: (error) => {
          this.logger.error(error);
        }
      });
  }

  public getSpecialtiesOptions(initialLoad = false): void {
    this.specialtyService
      .getSpecialtyOptionsListByDepartments(this.timelineForm.get('template.departments').value)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.specialtiesList = response;
          if (this.timelineToEdit && initialLoad) {
            this.timelineForm.get('template.specialties').setValue(
              this.timelineForm.get('template.specialties').value.map((item: SpecialtyDTO) => {
                let itemToReturn = item;
                response.forEach((group: SpecialtiesGroupedByDepartment) => {
                  const found = group.specialties.find((i: SpecialtyDTO) => i.id === item.id);
                  itemToReturn = found ? found : itemToReturn;
                });
                return itemToReturn;
              })
            );
          }
          let selected = this.timelineForm.get('template.specialties').value
            ? this.timelineForm.get('template.specialties').value
            : [];
          selected = selected.filter(
            (specialty: SpecialtyDTO) =>
              this.specialtiesList.filter(
                (sg: SpecialtiesGroupedByDepartment) =>
                  sg.specialties.filter((s: SpecialtyDTO) => s.id === specialty.id).length > 0
              ).length > 0
          );
          this.timelineForm.get('template.specialties').setValue(selected);
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
          if (this.timelineToEdit) {
            this.timelineForm
              .get('template.brands')
              .setValue(
                this.timelineForm
                  .get('template.brands')
                  .value.map((b: BrandDTO) => brands.find((brand: BrandDTO) => brand.id === b.id))
              );
            this.getFacilitiesOptions(true);
          }
        }
      })
    );
  }

  private deleteTimeline = () => {
    this.confirmDialogService
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('administration.templates.clientTimeline.deleteConfirmation'))
      })
      .subscribe((ok: boolean) => {
        if (ok) {
          const spinner = this.spinnerService.show();
          this.timelineService
            .deleteTimelineById(this.timelineToEdit.id)
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

  private getVariable(): void {
    this.variablesService.searchVariables().subscribe((res) => {
      this.textEditorToolbarOptions.macroListOptions = res.map((item: VariablesDTO) => item.name);
    });
  }

  private initializeForm(): void {
    const timelineItems: UntypedFormGroup[] = [];
    if (this.timelineToEdit?.templateTimelineItems?.length > 0) {
      this.timelineToEdit.templateTimelineItems
        .sort((a, b) => a.orderNumber - b.orderNumber)
        .forEach((item) => {
          const timelineItem = this.fb.group({
            name: [item.name, Validators.required],
            id: [item.id],
            orderNumber: [item.orderNumber],
            closed: [item.closed],
            messageLanding: [item.messageLanding]
          });
          timelineItems.push(timelineItem);
        });
    }
    this.timelineForm = this.fb.group({
      templateTimelineItems: this.fb.array(timelineItems, [Validators.required]),
      template: this.fb.group({
        name: [this.timelineToEdit ? this.timelineToEdit.template.name : null, Validators.required],
        brands: [this.timelineToEdit ? this.timelineToEdit.template.brands : null, Validators.required],
        facilities: [this.timelineToEdit ? this.timelineToEdit.template.facilities : null, Validators.required],
        departments: [this.timelineToEdit ? this.timelineToEdit.template.departments : null],
        specialties: [this.timelineToEdit ? this.timelineToEdit.template.specialties : null]
      })
    });
  }
}
