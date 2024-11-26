import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CustomerEntityDTO from '@data/models/entities/customer-entity-dto';
import { EntitiesService } from '@data/services/entities.service';
import { TranslateService } from '@ngx-translate/core';
import { CustomDialogFooterConfigI } from '@shared/modules/custom-dialog/interfaces/custom-dialog-footer-config';
import { ComponentToExtendForCustomDialog } from '@shared/modules/custom-dialog/models/component-for-custom-dialog';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { Observable, of } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';

export const enum CreateEditCustomerComponentModalEnum {
  ID = 'create-edit-customer-dialog-id',
  PANEL_CLASS = 'create-edit-customer-dialog',
  TITLE = 'entities.customers.create'
}

@Component({
  selector: 'app-modal-customer',
  templateUrl: './modal-customer.component.html',
  styleUrls: ['./modal-customer.component.scss']
})
export class ModalCustomerComponent extends ComponentToExtendForCustomDialog implements OnInit, OnDestroy {
  public labels = {
    title: marker('entities.customers.create'),
    createCustomer: marker('entities.customers.create'),
    editCustomer: marker('entities.customers.edit'),
    name: marker('entities.customers.name'),
    reference: marker('entities.customers.reference'),
    firstName: marker('entities.customers.firstName'),
    lastName: marker('entities.customers.lastName'),
    phone: marker('entities.customers.phone'),
    email: marker('entities.customers.email'),
    socialSecurityId: marker('entities.customers.socialSecurityId'),
    emailError: marker('errors.emailPattern'),
    required: marker('errors.required'),
    data: marker('userProfile.data'),
    notValidPattern: marker('entities.customers.notValidPattern'),
    isCompany: marker('entities.customers.isCompany')
  };
  public minLength = 3;
  public customerForm: FormGroup;
  public customerToEdit: CustomerEntityDTO;

  constructor(
    private fb: UntypedFormBuilder,
    private spinnerService: ProgressSpinnerDialogService,
    private confirmDialogService: ConfirmDialogService,
    private translateService: TranslateService,
    private globalMessageService: GlobalMessageService,
    private entitiesService: EntitiesService
  ) {
    super(
      CreateEditCustomerComponentModalEnum.ID,
      CreateEditCustomerComponentModalEnum.PANEL_CLASS,
      CreateEditCustomerComponentModalEnum.TITLE
    );
  }

  // Convenience getter for easy access to form fields
  get form() {
    return this.customerForm.controls;
  }

  ngOnInit(): void {
    this.customerToEdit = this.extendedComponentData;
    if (this.customerToEdit) {
      this.MODAL_TITLE = this.labels.editCustomer;
    }
    this.initializeForm();
  }

  ngOnDestroy(): void {}

  public confirmCloseCustomDialog(): Observable<boolean> {
    if (this.customerForm.touched && this.customerForm.dirty) {
      return this.confirmDialogService.open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('common.unsavedChangesExit'))
      });
    } else {
      return of(true);
    }
  }

  public onSubmitCustomDialog(): Observable<boolean | CustomerEntityDTO> {
    const formValue = this.customerForm.value;
    const spinner = this.spinnerService.show();
    return this.entitiesService.createCustomer(formValue).pipe(
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
          disabledFn: () => !(this.customerForm.touched && this.customerForm.dirty && this.customerForm.valid)
        }
      ]
    };
  }
  private initializeForm = (): void => {
    this.customerForm = this.fb.group({
      id: [this.customerToEdit ? this.customerToEdit.id : null],
      reference: [this.customerToEdit ? this.customerToEdit.reference : null],
      //Deshabilitar referencia cliente
      // reference: [{ value: this.customerToEdit ? this.customerToEdit.reference : null, disabled: true }],
      name: [this.customerToEdit ? this.customerToEdit.name : null],
      firstName: [this.customerToEdit ? this.customerToEdit.firstName : null],
      secondName: [this.customerToEdit ? this.customerToEdit.secondName : null],
      email: [this.customerToEdit ? this.customerToEdit.email : null, [Validators.email, Validators.required]],
      isCompany: [this.customerToEdit ? this.customerToEdit.isCompany : false],
      socialSecurityId: [
        this.customerToEdit ? this.customerToEdit.socialSecurityId : null,
        [Validators.required, Validators.pattern(/^[A-Za-z0-9]*$/)]
      ],
      phone: [this.customerToEdit ? this.customerToEdit.phone : null, [Validators.required]]
    });
  };
}
