import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { AttachmentDTO, CardAttachmentsDTO, CardPaymentAttachmentsDTO } from '@data/models/cards/card-attachments-dto';
import { CardPaymentLineDTO, CardPaymentsDTO, PaymentTypeDTO } from '@data/models/cards/card-payments-dto';
import CardInstanceDTO from '@data/models/cards/card-instance-dto';
import { CardAttachmentsService } from '@data/services/card-attachments.service';
import { CardPaymentsService } from '@data/services/card-payments.service';
import { CardMessagesService } from '@data/services/card-messages.service';
import { CustomDialogService } from '@jenga/custom-dialog';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { NGXLogger } from 'ngx-logger';
import { take } from 'rxjs/operators';
import CardInstancePaymentsConfig from './card-instance-payments-config-interface';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-card-instance-payments',
  templateUrl: './card-instance-payments.component.html',
  styleUrls: ['./card-instance-payments.component.scss']
})
export class CardInstancePaymentsComponent implements OnInit {
  @Input() cardInstancePaymentsConfig: CardInstancePaymentsConfig;
  @Input() data: CardPaymentsDTO;
  @Input() cardInstanceWorkflowId: number = null;
  @Input() tabId: number = null;
  @Input() cardInstance: CardInstanceDTO;
  @Output() reload: EventEmitter<boolean> = new EventEmitter<boolean>();
  public labels = {
    okClient: marker('common.okClient'),
    description: marker('common.description'),
    observations: marker('common.observations'),
    paymentType: marker('common.paymentType'),
    amount: marker('common.amount'),
    total: marker('common.total'),
    pending: marker('common.pending'),
    actions: marker('common.actions'),
    newLine: marker('common.newLine'),
    send: marker('common.send'),
    attachments: marker('common.attachments'),
    deleteConfirmation: marker('common.deleteConfirmation'),
    maxLengthError: marker('errors.maxLengthError')
  };
  public formTotal: FormGroup;
  public formPayments: FormArray;
  public currentPayment: CardPaymentsDTO;
  public paymentLines: CardPaymentLineDTO[];
  public attachmentsList: CardPaymentAttachmentsDTO[];
  public paymentTypes: PaymentTypeDTO[];
  public prevTotal: number;
  public editing = false;
  public editingTotal = false;
  public maxAmount = 99999999;
  constructor(
    private fb: FormBuilder,
    private paymentsService: CardPaymentsService,
    private logger: NGXLogger,
    private translateService: TranslateService,
    private confirmationDialog: ConfirmDialogService,
    private globalMessageService: GlobalMessageService,
    private customDialogService: CustomDialogService,
    private attachmentService: CardAttachmentsService
  ) {}
  public compareAttachments(object1: CardPaymentAttachmentsDTO, object2: CardPaymentAttachmentsDTO) {
    return object1 && object2 && object1.file.id === object2.file.id;
  }
  public cancelPayment(payment: FormGroup, index: number): void {
    if (payment.value.id) {
      payment.patchValue(this.currentPayment);
      payment.get('editMode').setValue(false);
    } else {
      this.formPayments.removeAt(index);
    }
    this.editing = false;
  }
  public savePayment(payment: FormGroup): void {
    this.confirmationDialog
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('cardDetail.payments.saveConfirmation'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          const paymentData = payment.getRawValue();
          if (paymentData.attachments?.length) {
            paymentData.attachments = paymentData.attachments.map((att1: CardPaymentAttachmentsDTO) => {
              let attachment = att1;
              if (
                paymentData.attachmentsOriginal?.length &&
                paymentData.attachmentsOriginal.find((att2: CardPaymentAttachmentsDTO) => att1.file.id === att2.file.id)
              ) {
                attachment = paymentData.attachmentsOriginal.find(
                  (att2: CardPaymentAttachmentsDTO) => att1.file.id === att2.file.id
                );
              }
              return attachment;
            });
          } else {
            paymentData.attachments = [];
          }
          if (payment.value.id) {
            this.paymentsService
              .addEditLine(this.cardInstanceWorkflowId, this.tabId, paymentData)
              .pipe(take(1))
              .subscribe(
                (data) => {
                  this.reload.emit(true);
                },
                (error: ConcenetError) => {
                  this.logger.error(error);

                  this.globalMessageService.showError({
                    message: error.message,
                    actionText: this.translateService.instant(marker('common.close'))
                  });
                }
              );
          } else {
            this.paymentsService
              .addEditLine(this.cardInstanceWorkflowId, this.tabId, paymentData)
              .pipe(take(1))
              .subscribe(
                (data) => {
                  this.reload.emit(true);
                },
                (error: ConcenetError) => {
                  this.logger.error(error);
                  this.globalMessageService.showError({
                    message: error.message,
                    actionText: this.translateService.instant(marker('common.close'))
                  });
                }
              );
          }
        }
      });
  }
  public deletePayment(payment: FormGroup): void {
    this.confirmationDialog
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('cardDetail.payments.deleteConfirmation'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          this.paymentsService
            .deleteLine(this.cardInstanceWorkflowId, this.tabId, payment.value.id)
            .pipe(take(1))
            .subscribe(
              (data) => {
                this.reload.emit(true);
              },
              (error: ConcenetError) => {
                this.logger.error(error);

                this.globalMessageService.showError({
                  message: error.message,
                  actionText: this.translateService.instant(marker('common.close'))
                });
              }
            );
        }
      });
  }
  public saveTotal(): void {
    if (this.formTotal.get('total').dirty && this.formTotal.get('total').touched) {
      this.confirmationDialog
        .open({
          title: this.translateService.instant(marker('common.warning')),
          message: this.translateService.instant(marker('cardDetail.payments.saveTotalConfirmation'))
        })
        .pipe(take(1))
        .subscribe((ok: boolean) => {
          if (ok) {
            this.paymentsService
              .saveTotal(this.cardInstanceWorkflowId, this.tabId, this.formTotal.getRawValue())
              .pipe(take(1))
              .subscribe(
                () => {
                  this.reload.emit(true);
                },
                (error: ConcenetError) => {
                  this.logger.error(error);
                  this.globalMessageService.showError({
                    message: error.message,
                    actionText: this.translateService.instant(marker('common.close'))
                  });
                }
              );
          } else {
            this.formTotal.get('total').setValue(this.prevTotal);
            this.editingTotal = false;
          }
        });
    } else {
      this.editingTotal = false;
    }
  }
  public editPayment(payment: FormGroup): void {
    this.editing = true;
    this.currentPayment = payment.getRawValue();
    payment.get('editMode').setValue(true);
  }
  public editTotal(): void {
    this.prevTotal = this.formTotal.get('total').value;
    this.editingTotal = true;
  }
  public paymentDisabled(payment: FormGroup): boolean {
    return !payment.value.editMode;
  }
  public newLine() {
    this.editing = true;
    this.formPayments.push(
      this.fb.group({
        id: [null],
        amount: ['', [Validators.max(this.maxAmount), Validators.required]],
        attachments: [],
        description: ['', Validators.required],
        cardInstancePaymentDTO: [{ id: this.data.id }, [Validators.required]],
        observations: [''],
        paymentType: [null, [Validators.required]],
        editMode: [true],
        attachmentsOriginal: []
      })
    );
  }
  public initializeForms() {
    this.formTotal = this.fb.group({
      id: [this.data?.id ? this.data?.id : null],
      cardInstance: [
        this.data?.cardInstance ? this.data?.cardInstance : { id: this.cardInstanceWorkflowId },
        [Validators.required]
      ],
      tab: [this.data?.tab ? this.data?.tab : { id: this.tabId }, [Validators.required]],
      total: [this.data?.total ? this.data?.total : '', [Validators.max(this.maxAmount), Validators.required]],
      pending: [this.data?.pending ? this.data?.pending : '']
    });
    this.formPayments = this.fb.array([]);
    if (this.data && this.data.paymentLines?.length) {
      this.data.paymentLines.forEach((data: CardPaymentLineDTO) => {
        this.formPayments.push(
          this.fb.group({
            id: [data.id],
            amount: [data.amount, [Validators.max(this.maxAmount), Validators.required]],
            attachments: [data.attachments],
            description: [data.description, [Validators.required]],
            observations: [data.observations],
            paymentType: [
              data.paymentType ? this.paymentTypes.find((value: PaymentTypeDTO) => value.id === data.paymentType.id) : null,
              [Validators.required]
            ],
            editMode: [false],
            attachmentsOriginal: [data.attachments]
          })
        );
      });
    }
  }
  ngOnInit(): void {
    this.paymentLines = this.data?.paymentLines?.length ? this.data.paymentLines : [];
    const resquests = [
      this.attachmentService.getCardAttachmentsByInstance(this.cardInstanceWorkflowId).pipe(take(1)),
      this.paymentsService.getCardPaymentTypes().pipe(take(1))
    ];
    forkJoin(resquests).subscribe(
      (responses: [CardAttachmentsDTO[], PaymentTypeDTO[]]) => {
        this.paymentTypes = responses[1];
        this.attachmentsList = [];
        responses[0].forEach((attachment: CardAttachmentsDTO) => {
          attachment.attachments.forEach((att: AttachmentDTO) => {
            this.attachmentsList.push({
              cardInstance: this.cardInstance,
              tab: { id: attachment.tabId },
              file: att,
              templateAttachmentItem: attachment.templateAttachmentItem
            } as CardPaymentAttachmentsDTO);
          });
        });
        this.initializeForms();
      },
      (errors) => {
        this.logger.error(errors);
      }
    );
  }
}
