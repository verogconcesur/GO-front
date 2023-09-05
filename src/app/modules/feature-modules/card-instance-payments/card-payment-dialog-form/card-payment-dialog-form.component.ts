import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { CardPaymentAttachmentsDTO } from '@data/models/cards/card-attachments-dto';
import { CardPaymentLineDTO, CardPaymentsDTO, PaymentStatesDTO, PaymentTypeDTO } from '@data/models/cards/card-payments-dto';
import { ComponentToExtendForCustomDialog, CustomDialogFooterConfigI } from '@frontend/custom-dialog';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { Observable, of } from 'rxjs';

export const enum CardPaymentDialogEnum {
  ID = 'card-payment-dialog-id',
  PANEL_CLASS = 'card-payment-dialog',
  TITLE = 'cardDetail.payments.newLine'
}

@Component({
  selector: 'app-card-payment-dialog-form',
  templateUrl: './card-payment-dialog-form.component.html',
  styleUrls: ['./card-payment-dialog-form.component.scss']
})
export class CardPaymentDialogFormComponent extends ComponentToExtendForCustomDialog implements OnInit, OnDestroy {
  public paymentLine: CardPaymentLineDTO = null;
  public paymentTypes: PaymentTypeDTO[] = [];
  public paymentStates: PaymentStatesDTO[] = [];
  public cardInstancePayment: CardPaymentsDTO = null;
  public paymentLineForm: UntypedFormGroup = null;
  public attachmentsList: CardPaymentAttachmentsDTO[];
  public labels = {
    newPaymentLine: marker('cardDetail.payments.newLine'),
    editPaymentLine: marker('cardDetail.payments.editLine'),
    okClient: marker('common.okClient'),
    description: marker('common.description'),
    observations: marker('common.observations'),
    paymentType: marker('common.paymentType'),
    amount: marker('common.amount'),
    state: marker('common.state'),
    attachments: marker('common.attachments'),
    maxLengthError: marker('errors.maxLengthError'),
    required: marker('errors.required')
  };
  public maxAmount = 99999999;
  constructor(
    public fb: FormBuilder,
    public confirmDialogService: ConfirmDialogService,
    public translateService: TranslateService
  ) {
    super(CardPaymentDialogEnum.ID, CardPaymentDialogEnum.PANEL_CLASS, CardPaymentDialogEnum.TITLE);
  }

  // Convenience getter for easy access to form fields
  get form() {
    return this.paymentLineForm.controls;
  }

  ngOnInit(): void {
    this.paymentTypes = this.extendedComponentData.paymentTypes;
    this.paymentStates = this.extendedComponentData.paymentStates;
    this.cardInstancePayment = this.extendedComponentData.cardInstancePaymentDTO;
    this.attachmentsList = this.extendedComponentData.attachmentsList;
    if (this.extendedComponentData.payment) {
      this.paymentLine = this.extendedComponentData.payment;
      this.MODAL_TITLE = this.labels.editPaymentLine;
    } else {
      this.MODAL_TITLE = this.labels.newPaymentLine;
    }
    this.initForm();
  }

  ngOnDestroy(): void {}
  public paymentAmountDisabled(): boolean {
    // Si ya está pagada se deshabilita
    if (this.form?.paymentState?.value?.id === 3) {
      this.form?.amount.disable();
      return true;
    }
    this.form?.amount.enable();
    return false;
  }
  public paymentStateDisabled(): boolean {
    //Si el tipo de pago es área cliente se deshabilita
    if (this.form?.paymentType?.value?.id === 5) {
      return true;
    }
    return false;
  }
  public paymentTypeDisabled(): boolean {
    if (this.form?.paymentState?.value?.id === 3) {
      return true;
    }
    return false;
  }
  public compareAttachments(object1: CardPaymentAttachmentsDTO, object2: CardPaymentAttachmentsDTO) {
    return object1 && object2 && object1.file.id === object2.file.id;
  }
  public changePaymentType(): void {
    const type: PaymentTypeDTO = this.form.paymentType.value;
    if (this.paymentLine?.paymentType?.id === type.id && this.paymentLine?.paymentState) {
      this.paymentLineForm
        .get('paymentState')
        .setValue(this.paymentStates.find((p) => p.id === this.paymentLine.paymentState.id));
    } else if (type.id === 5) {
      this.paymentLineForm.get('paymentState').setValue(this.paymentStates.find((p) => p.id === 1));
    } else {
      this.paymentLineForm.get('paymentState').setValue(null);
    }
  }

  public confirmCloseCustomDialog(): Observable<boolean> {
    if (this.paymentLineForm.touched && this.paymentLineForm.dirty) {
      return this.confirmDialogService.open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('common.unsavedChangesExit'))
      });
    } else {
      return of(true);
    }
  }

  public onSubmitCustomDialog(): Observable<boolean | UntypedFormGroup> {
    if (this.paymentLineForm.touched && this.paymentLineForm.dirty) {
      return of(this.paymentLineForm);
    }
    return of(false);
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
          disabledFn: () => !(this.paymentLineForm.touched && this.paymentLineForm.dirty && this.paymentLineForm.valid)
        }
      ]
    };
  }

  private initForm(): void {
    this.paymentLineForm = this.fb.group({
      id: [this.paymentLine?.id ? this.paymentLine.id : null],
      amount: [this.paymentLine?.amount ? this.paymentLine.amount : '', [Validators.max(this.maxAmount), Validators.required]],
      attachments: [this.paymentLine?.attachments ? this.paymentLine.attachments : null],
      description: [this.paymentLine?.description ? this.paymentLine.description : '', Validators.required],
      cardInstancePaymentDTO: [this.cardInstancePayment, [Validators.required]],
      observations: [this.paymentLine?.observations ? this.paymentLine.observations : ''],
      paymentType: [
        this.paymentLine?.paymentType ? this.paymentTypes.find((pt) => this.paymentLine.paymentType.id === pt.id) : null,
        [Validators.required]
      ],
      paymentState: [
        this.paymentLine?.paymentState ? this.paymentStates.find((ps) => this.paymentLine.paymentState.id === ps.id) : null,
        [Validators.required]
      ],
      editMode: [true],
      attachmentsOriginal: [this.paymentLine?.attachments ? this.paymentLine.attachments : null]
    });
  }
}
