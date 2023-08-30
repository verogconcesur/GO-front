import { Component, OnInit } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import RepairOrderEntityDTO from '@data/models/entities/repair-order-entity-dto';
import BrandDTO from '@data/models/organization/brand-dto';
import { EntitiesService } from '@data/services/entities.service';
import { ComponentToExtendForCustomDialog, CustomDialogFooterConfigI } from '@frontend/custom-dialog';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { Observable, of } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';

export const enum CreateEditRepairOrderComponentModalEnum {
  ID = 'create-edit-repair-order-dialog-id',
  PANEL_CLASS = 'create-edit-repair-order-dialog',
  TITLE = 'entities.repairOrders.create'
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
    jobsDescription: marker('entities.repairOrders.jobsDescription')
  };
  public repairOrderForm: FormGroup;
  public repairOrderToEdit: RepairOrderEntityDTO;

  constructor(
    private fb: UntypedFormBuilder,
    private spinnerService: ProgressSpinnerDialogService,
    private confirmDialogService: ConfirmDialogService,
    private translateService: TranslateService,
    private globalMessageService: GlobalMessageService,
    private entitiesService: EntitiesService
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

  ngOnInit(): void {
    this.repairOrderToEdit = this.extendedComponentData;
    if (this.repairOrderToEdit) {
      this.MODAL_TITLE = this.labels.editRepairOrder;
    }
    this.initializeForm();
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
    const formValue = this.repairOrderForm.value;
    const spinner = this.spinnerService.show();
    return this.entitiesService.createRepairOrder(formValue).pipe(
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
      leftSideButtons: [],
      rightSideButtons: [
        {
          type: 'submit',
          label: marker('common.save'),
          design: 'raised',
          color: 'primary',
          disabledFn: () => !(this.repairOrderForm.touched && this.repairOrderForm.dirty && this.repairOrderForm.valid)
        }
      ]
    };
  }
  private initializeForm = (): void => {
    this.repairOrderForm = this.fb.group({
      id: [this.repairOrderToEdit ? this.repairOrderToEdit.id : null],
      reference: [this.repairOrderToEdit ? this.repairOrderToEdit.reference : null, [Validators.required]],
      jobsDescription: [this.repairOrderToEdit ? this.repairOrderToEdit.jobsDescription : null]
    });
  };
}
