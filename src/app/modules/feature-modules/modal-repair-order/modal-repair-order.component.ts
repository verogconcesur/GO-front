import { Component, OnInit } from '@angular/core';
import { FormArray, FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ModulesConstants } from '@app/constants/modules.constants';
import { AuthenticationService } from '@app/security/authentication.service';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import RepairOrderEntityDTO from '@data/models/entities/repair-order-entity-dto';
import FacilityDTO from '@data/models/organization/facility-dto';
import { EntitiesService } from '@data/services/entities.service';
import { FacilityService } from '@data/services/facility.sevice';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import { CustomDialogFooterConfigI } from '@shared/modules/custom-dialog/interfaces/custom-dialog-footer-config';
import { ComponentToExtendForCustomDialog } from '@shared/modules/custom-dialog/models/component-for-custom-dialog';
import { CustomDialogService } from '@shared/modules/custom-dialog/services/custom-dialog.service';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { validateDateFormat } from '@shared/utils/validate-date-format-function';
import { Observable, of } from 'rxjs';
import { finalize, take, tap } from 'rxjs/operators';

export const enum CreateEditRepairOrderComponentModalEnum {
  ID = 'create-edit-repair-order-dialog-id',
  PANEL_CLASS = 'create-edit-repair-order-dialog',
  TITLE = 'entities.repairOrders.create'
}
interface CustomDateObject {
  _isAMomentObject: boolean;
  _d: Date;
  _i: {
    date: number;
    month: number;
    year: number;
  };
  _isUTC: boolean;
  _isValid: boolean;
}

@Component({
  selector: 'app-modal-repair-order',
  templateUrl: './modal-repair-order.component.html',
  styleUrls: ['./modal-repair-order.component.scss']
})
export class ModalRepairOrderComponent extends ComponentToExtendForCustomDialog implements OnInit {
  public labels = {
    title: marker('entities.repairOrders.create'),
    editRepairOrder: marker('entities.repairOrders.create'),
    data: marker('userProfile.data'),
    reference: marker('entities.repairOrders.reference'),
    required: marker('errors.required'),
    jobsDescription: marker('entities.repairOrders.jobsDescription'),
    date: marker('entities.repairOrders.date'),
    facility: marker('entities.repairOrders.facility')
  };
  public repairOrderForm: FormGroup;
  public repairOrderToEdit: RepairOrderEntityDTO;
  public startDate: Date;
  public endDate: Date;
  public facilityAsyncList: Observable<FacilityDTO[]>;
  public showReference = true;
  public facilityList: FacilityDTO[];
  public showButtonLines = false;

  constructor(
    private fb: UntypedFormBuilder,
    private spinnerService: ProgressSpinnerDialogService,
    private confirmDialogService: ConfirmDialogService,
    private translateService: TranslateService,
    private globalMessageService: GlobalMessageService,
    private entitiesService: EntitiesService,
    private facilityService: FacilityService,
    private confirmationDialog: ConfirmDialogService,
    private customDialogService: CustomDialogService,
    private authService: AuthenticationService
  ) {
    super(
      CreateEditRepairOrderComponentModalEnum.ID,
      CreateEditRepairOrderComponentModalEnum.PANEL_CLASS,
      CreateEditRepairOrderComponentModalEnum.TITLE
    );
  }

  // Convenience getter for easy access to form fields
  get form() {
    return this.repairOrderForm.controls;
  }
  get lines(): FormArray {
    return this.repairOrderForm.get('lines') as FormArray;
  }

  ngOnInit(): void {
    this.repairOrderToEdit = this.extendedComponentData;
    if (this.repairOrderToEdit) {
      this.MODAL_TITLE = this.labels.editRepairOrder;
    }
    this.initializeForm();
    this.getFacilitiesList();
  }

  public getFacilitiesList() {
    this.facilityAsyncList = this.facilityService.getFacilitiesByBrandsIds().pipe(
      tap({
        next: (facilities: FacilityDTO[]) => {
          this.facilityList = facilities;
          this.isAutoline(true);
          const selectedFacility = this.repairOrderForm.get('facility').value;
          if (typeof selectedFacility === 'object') {
            this.repairOrderForm.get('facility').setValue(
              facilities.find((facility: FacilityDTO) => facility.id === selectedFacility?.id),
              { emitEvent: false }
            );
          } else {
            this.repairOrderForm.get('facility').setValue(
              facilities.find((facility: FacilityDTO) => facility.id === selectedFacility),
              { emitEvent: false }
            );
          }
        }
      })
    );
  }

  public confirmCloseCustomDialog(): Observable<boolean> {
    if (this.repairOrderForm.touched && this.repairOrderForm.dirty) {
      return this.confirmDialogService.open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('common.unsavedChangesExit'))
      });
    } else {
      return of(true);
    }
  }

  public onSubmitCustomDialog(): Observable<boolean | RepairOrderEntityDTO> {
    return of(true);
  }

  public confirmCreateOrderRepair = () => {
    const configList = this.authService.getConfigList();
    const isWriteKeyloopEnabled = configList.includes(ModulesConstants.WRITE_KEYLOOP);
    const formValue = this.repairOrderForm.getRawValue();
    const jobNames: string[] = [];
    const linesArray = this.repairOrderForm.get('lines') as FormArray;
    linesArray.controls.forEach((lineGroup: FormGroup) => {
      const nameControl = lineGroup.get('name');
      if (nameControl) {
        jobNames.push(nameControl.value);
      }
    });
    if (this.showReference === true && isWriteKeyloopEnabled) {
      const spinner = this.spinnerService.show();
      this.entitiesService
        .createRepairOrder({
          id: formValue.id,
          reference: formValue.reference,
          jobsDescription: formValue.jobsDescription,
          vehicle: formValue.vehicle,
          customer: formValue.customer,
          dueInDatetime: this.convertToMilliseconds(formValue.dueInDatetime).toString(),
          facility: formValue.facility,
          notes: formValue.notes,
          playerAccount: formValue.playerAccount,
          jobs: jobNames
        })
        .pipe(
          take(1),
          finalize(() => this.spinnerService.hide(spinner))
        )
        .subscribe({
          next: (response) => {
            this.customDialogService.close(this.MODAL_ID, response);
            this.globalMessageService.showSuccess({
              message: this.translateService.instant(marker('common.successOperation')),
              actionText: this.translateService.instant(marker('common.close'))
            });
            return response;
          },
          error: (error) => {
            this.globalMessageService.showError({
              message: error.message,
              actionText: this.translateService.instant(marker('common.close'))
            });
          }
        });
    } else {
      this.confirmationDialog
        .open({
          title: this.translateService.instant(marker('common.warning')),
          message: this.translateService.instant(marker('entities.repairOrders.createTitle'))
        })
        .pipe(take(1))
        .subscribe((ok: boolean) => {
          if (ok) {
            const spinner = this.spinnerService.show();
            this.entitiesService
              .createRepairOrder({
                id: formValue.id,
                reference: formValue.reference,
                jobsDescription: formValue.jobsDescription,
                vehicle: formValue.vehicle,
                customer: formValue.customer,
                dueInDatetime: this.convertToMilliseconds(formValue.dueInDatetime).toString(),
                facility: formValue.facility,
                notes: formValue.notes,
                playerAccount: formValue.playerAccount,
                jobs: jobNames
              })
              .pipe(
                take(1),
                finalize(() => this.spinnerService.hide(spinner))
              )
              .subscribe({
                next: (response) => {
                  this.customDialogService.close(this.MODAL_ID, response);
                  this.globalMessageService.showSuccess({
                    message: this.translateService.instant(marker('common.successOperation')),
                    actionText: this.translateService.instant(marker('common.close'))
                  });
                  return response;
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
    }
  };
  public isAutoline(firstLoad: boolean) {
    const facilitySelected = this.facilityList.find((facility) => facility.id === this.repairOrderForm.get('facility').value);
    console.log(facilitySelected);
    if (facilitySelected) {
      if (facilitySelected.configApiExtDmsType === 'AUTOLINE') {
        this.showReference = false;
        this.repairOrderForm.get('reference').disable();
        this.repairOrderForm.get('jobsDescription').disable();
        this.showButtonLines = true;
        if (!firstLoad) {
          this.repairOrderForm.get('reference').setValue(null);
        }
      } else {
        this.showReference = true;
        this.showButtonLines = false;
        this.repairOrderForm.get('reference').enable();
        this.repairOrderForm.get('jobsDescription').enable();
      }
    }
  }
  public convertToMilliseconds(value: CustomDateObject): number | null {
    if (!value) {
      return null;
    }
    const { _d: date } = value;
    if (date instanceof Date) {
      return date.getTime();
    }
    return null;
  }
  public getDateErrorMessage(value: string): string {
    if (!value || value === '') {
      return this.translateService.instant(this.labels.required);
    }
    return validateDateFormat(value, this.translateService);
  }
  public setAndGetFooterConfig(): CustomDialogFooterConfigI | null {
    return {
      show: true,
      leftSideButtons: [],
      rightSideButtons: [
        {
          type: 'custom',
          label: marker('common.save'),
          design: 'raised',
          color: 'primary',
          clickFn: this.confirmCreateOrderRepair,
          disabledFn: () => !(this.repairOrderForm.touched && this.repairOrderForm.dirty && this.repairOrderForm.valid)
        }
      ]
    };
  }
  addLine(): void {
    const lineIndex = this.lines.length + 1;
    const newLine = this.fb.group({
      name: ['', Validators.required]
    });
    this.lines.push(newLine);
  }
  private initializeForm = (): void => {
    const configList = this.authService.getConfigList();
    const isWriteKeyloopEnabled = configList.includes(ModulesConstants.WRITE_KEYLOOP);
    this.repairOrderForm = this.fb.group({
      id: [this.repairOrderToEdit ? this.repairOrderToEdit?.id : null],
      reference: [{ value: this.repairOrderToEdit ? this.repairOrderToEdit?.reference : null, disabled: isWriteKeyloopEnabled }],
      jobsDescription: [this.repairOrderToEdit ? this.repairOrderToEdit?.jobsDescription : null],
      vehicle: [this.repairOrderToEdit ? this.repairOrderToEdit?.vehicle : null],
      customer: [this.repairOrderToEdit ? this.repairOrderToEdit?.customer : null],
      playerAccount: [this.repairOrderToEdit ? this.repairOrderToEdit?.playerAccount : null],
      dueInDatetime: [this.repairOrderToEdit ? new Date(this.repairOrderToEdit?.dueInDatetime) : null, [Validators.required]],
      facility: [{ value: this.repairOrderToEdit ? this.repairOrderToEdit?.facility : null, disabled: true }],
      notes: [this.repairOrderToEdit ? this.repairOrderToEdit?.notes : null],
      lines: this.fb.array([])
    });
    this.repairOrderForm.controls.facility.valueChanges.pipe(untilDestroyed(this)).subscribe((x) => {
      this.isAutoline(false);
    });
  };
}
