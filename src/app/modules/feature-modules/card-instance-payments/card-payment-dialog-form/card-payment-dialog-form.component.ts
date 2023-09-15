import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { AttachmentDTO, CardPaymentAttachmentsDTO } from '@data/models/cards/card-attachments-dto';
import { CardPaymentLineDTO, CardPaymentsDTO, PaymentStatusDTO, PaymentTypeDTO } from '@data/models/cards/card-payments-dto';
import { CardAttachmentsService } from '@data/services/card-attachments.service';
import { ComponentToExtendForCustomDialog, CustomDialogFooterConfigI } from '@frontend/custom-dialog';
import { MediaViewerService } from '@modules/feature-modules/media-viewer-dialog/media-viewer.service';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { Observable, finalize, of, take } from 'rxjs';

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
  public paymentStatus: PaymentStatusDTO[] = [];
  public cardInstancePayment: CardPaymentsDTO = null;
  public paymentLineForm: UntypedFormGroup = null;
  public attachmentsList: CardPaymentAttachmentsDTO[];
  public cardInstanceWorkflowId: number;
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
    public translateService: TranslateService,
    public mediaViewerService: MediaViewerService,
    public cardAttachmentsService: CardAttachmentsService,
    private spinnerService: ProgressSpinnerDialogService,
    private globalMessageService: GlobalMessageService
  ) {
    super(CardPaymentDialogEnum.ID, CardPaymentDialogEnum.PANEL_CLASS, CardPaymentDialogEnum.TITLE);
  }

  // Convenience getter for easy access to form fields
  get form() {
    return this.paymentLineForm.controls;
  }

  ngOnInit(): void {
    this.paymentTypes = this.extendedComponentData.paymentTypes;
    this.paymentStatus = this.extendedComponentData.paymentStatus;
    this.cardInstancePayment = this.extendedComponentData.cardInstancePaymentDTO;
    this.cardInstanceWorkflowId = this.extendedComponentData.cardInstanceWorkflowId;
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

  // {id: 1, name: "Creada"}
  // {id: 2, name: "Pendiente de pago"}
  // {id: 3, name: "Pagada"}
  // {id: 4, name: "Error en el pago"}
  // {id: 5, name: "Rechazado"}
  // {id: 6, name: "Denegado"}
  public paymentAmountDisabled(): boolean {
    // Si ya está pagada o denegada se deshabilita
    if (this.form?.paymentStatus?.value?.id === 3 || this.form?.paymentStatus?.value?.id === 6) {
      this.form?.amount.disable();
      return true;
    }
    this.form?.amount.enable();
    return false;
  }
  public paymentStatusDisabled(): boolean {
    //Si el tipo de pago es área cliente se deshabilita o está denegada
    if (this.form?.paymentType?.value?.id === 5 || this.form?.paymentStatus?.value?.id === 6) {
      return true;
    }
    return false;
  }
  public paymentTypeDisabled(): boolean {
    // Si ya está pagada o denegada se deshabilita
    if (this.form?.paymentStatus?.value?.id === 3 || this.form?.paymentStatus?.value?.id === 6) {
      return true;
    }
    return false;
  }
  public compareAttachments(object1: CardPaymentAttachmentsDTO, object2: CardPaymentAttachmentsDTO) {
    return object1 && object2 && object1.file.id === object2.file.id;
  }
  public changePaymentType(): void {
    const type: PaymentTypeDTO = this.form.paymentType.value;
    if (this.paymentLine?.paymentType?.id === type.id && this.paymentLine?.paymentStatus) {
      this.paymentLineForm
        .get('paymentStatus')
        .setValue(this.paymentStatus.find((p) => p.id === this.paymentLine.paymentStatus.id));
    } else if (type.id === 5) {
      this.paymentLineForm.get('paymentStatus').setValue(this.paymentStatus.find((p) => p.id === 1));
    } else {
      this.paymentLineForm.get('paymentStatus').setValue(null);
    }
  }

  public openMedia(attachment: CardPaymentAttachmentsDTO): void {
    const file: AttachmentDTO = attachment.file;
    if (file.content) {
      this.mediaViewerService.openMediaViewer(file);
    } else {
      const spinner = this.spinnerService.show();
      this.cardAttachmentsService
        .downloadAttachment(this.cardInstanceWorkflowId, null, file.id)
        .pipe(
          take(1),
          finalize(() => this.spinnerService.hide(spinner))
        )
        .subscribe((data) => {
          this.attachmentsList.map((att) => {
            if (att.file.id === data.id) {
              att.file.content = data.content;
            }
            return att;
          });
          this.mediaViewerService.openMediaViewer(data);
        });
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
      if (this.form?.paymentType?.value?.id === 5 && this.form?.amount?.value <= 0) {
        this.globalMessageService.showError({
          message: this.translateService.instant(marker('cardDetail.payments.langindOnlyPositiveAmounts')),
          actionText: this.translateService.instant(marker('common.close'))
        });
        return of(false);
      }
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
      paymentStatus: [
        this.paymentLine?.paymentStatus ? this.paymentStatus.find((ps) => this.paymentLine.paymentStatus.id === ps.id) : null,
        [Validators.required]
      ],
      editMode: [true],
      attachmentsOriginal: [this.paymentLine?.attachments ? this.paymentLine.attachments : null]
    });
  }
}
