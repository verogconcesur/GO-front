import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, UntypedFormGroup, Validators } from '@angular/forms';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { AttachmentDTO, CardAttachmentsDTO, CardPaymentAttachmentsDTO } from '@data/models/cards/card-attachments-dto';
// eslint-disable-next-line max-len
import {
  CardPaymentLineDTO,
  CardPaymentsDTO,
  CardTotalLineDTO,
  PaymentStatusDTO,
  PaymentTypeDTO
} from '@data/models/cards/card-payments-dto';
import CardInstanceDTO from '@data/models/cards/card-instance-dto';
import { CardAttachmentsService } from '@data/services/card-attachments.service';
import { CardPaymentsService } from '@data/services/card-payments.service';
import { CardMessagesService } from '@data/services/card-messages.service';
import { CustomDialogService } from '@frontend/custom-dialog';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { NGXLogger } from 'ngx-logger';
import { take } from 'rxjs/operators';
import CardInstancePaymentsConfig from './card-instance-payments-config-interface';
import { forkJoin } from 'rxjs';
import {
  CardPaymentDialogEnum,
  CardPaymentDialogFormComponent
} from './card-payment-dialog-form/card-payment-dialog-form.component';

@Component({
  selector: 'app-card-instance-payments',
  templateUrl: './card-instance-payments.component.html',
  styleUrls: ['./card-instance-payments.component.scss'],
  encapsulation: ViewEncapsulation.None
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
    pendingDescription: marker('cardDetail.payments.pendingAmount'),
    customerAccount: marker('cardDetail.payments.customerAccount'),
    state: marker('common.state'),
    actions: marker('common.actions'),
    newLine: marker('cardDetail.payments.newLine'),
    newTotalLine: marker('cardDetail.payments.newTotalLine'),
    send: marker('common.send'),
    sendPayment: marker('cardDetail.payments.send'),
    resendPayment: marker('cardDetail.payments.resend'),
    attachments: marker('common.attachments'),
    deleteConfirmation: marker('common.deleteConfirmation'),
    maxLengthError: marker('errors.maxLengthError'),
    value: marker('common.value')
  };
  public formTotal: FormGroup;
  public paymentLines: CardPaymentLineDTO[];
  public totalLines: CardTotalLineDTO[];
  public paymentStatus: PaymentStatusDTO[];
  public attachmentsList: CardPaymentAttachmentsDTO[];
  public paymentTypes: PaymentTypeDTO[];
  public prevTotal: number;
  public prevCustomerAccount: string;
  public editing = false;
  public editingTotal = false;
  public editingAccount = false;
  public maxAmount = 99999999;
  constructor(
    private fb: FormBuilder,
    private paymentsService: CardPaymentsService,
    private logger: NGXLogger,
    private translateService: TranslateService,
    private confirmationDialog: ConfirmDialogService,
    private globalMessageService: GlobalMessageService,
    private customDialogService: CustomDialogService,
    private attachmentService: CardAttachmentsService,
    private cardMessageService: CardMessagesService
  ) {}
  public compareAttachments(object1: CardPaymentAttachmentsDTO, object2: CardPaymentAttachmentsDTO) {
    return object1 && object2 && object1.file.id === object2.file.id;
  }
  public getSendLabel(payment: CardPaymentLineDTO): string {
    if (payment.paymentStatus.id === 1) {
      return this.labels.sendPayment;
    } else {
      return this.labels.resendPayment;
    }
  }
  public sendPayment(payment: CardPaymentLineDTO): void {
    this.confirmationDialog
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('cardDetail.payments.sendConfirmation'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          this.cardMessageService
            .sendPaymentMessageClient(this.cardInstanceWorkflowId, payment.id)
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
  public savePayment(payment: UntypedFormGroup): void {
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
      });
  }
  public deletePayment(payment: CardPaymentLineDTO, index: number): void {
    this.confirmationDialog
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('cardDetail.payments.deleteConfirmation'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          this.paymentsService
            .deleteLine(this.cardInstanceWorkflowId, this.tabId, payment.id)
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

  public saveTotalLine(totalLine: UntypedFormGroup): void {
    this.confirmationDialog
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('cardDetail.payments.saveTotalLineConfirmation'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          const totalLineData = totalLine.getRawValue();
          if (totalLineData.attachments?.length) {
            totalLineData.attachments = totalLineData.attachments.map((att1: CardPaymentAttachmentsDTO) => {
              let attachment = att1;
              if (
                totalLineData.attachmentsOriginal?.length &&
                totalLineData.attachmentsOriginal.find((att2: CardPaymentAttachmentsDTO) => att1.file.id === att2.file.id)
              ) {
                attachment = totalLineData.attachmentsOriginal.find(
                  (att2: CardPaymentAttachmentsDTO) => att1.file.id === att2.file.id
                );
              }
              return attachment;
            });
          } else {
            totalLineData.attachments = [];
          }
          this.paymentsService
            .addEditTotalLine(this.cardInstanceWorkflowId, this.tabId, totalLineData)
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
  public deleteTotalLine(line: CardTotalLineDTO, index: number): void {
    this.confirmationDialog
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('cardDetail.payments.deleteConfirmation'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          this.paymentsService
            .deleteTotalLine(this.cardInstanceWorkflowId, this.tabId, line.id)
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

  public saveCustomerAccount(): void {
    if (this.formTotal.get('customerAccount').dirty && this.formTotal.get('customerAccount').touched) {
      this.confirmationDialog
        .open({
          title: this.translateService.instant(marker('common.warning')),
          message: this.translateService.instant(marker('cardDetail.payments.saveCustomerAccountConfirmation'))
        })
        .pipe(take(1))
        .subscribe((ok: boolean) => {
          if (ok) {
            this.paymentsService
              .saveCustomerAccount(this.cardInstanceWorkflowId, this.tabId, this.formTotal.getRawValue())
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
            this.formTotal.get('customerAccount').setValue(this.prevCustomerAccount);
            this.editingAccount = false;
          }
        });
    } else {
      this.editingAccount = false;
    }
  }
  public editPayment(payment: CardPaymentLineDTO, index: number): void {
    this.customDialogService
      .open({
        component: CardPaymentDialogFormComponent,
        extendedComponentData: {
          payment,
          paymentTypes: this.paymentTypes,
          paymentStatus: this.paymentStatus,
          cardInstancePaymentDTO: { id: this.data?.id ? this.data.id : null },
          attachmentsList: this.attachmentsList,
          cardInstanceWorkflowId: this.cardInstanceWorkflowId
        },
        id: CardPaymentDialogEnum.ID,
        panelClass: CardPaymentDialogEnum.PANEL_CLASS,
        disableClose: true,
        width: '900px'
      })
      .pipe(take(1))
      .subscribe((response) => {
        if (response) {
          console.log(response);
          this.savePayment(response);
        }
      });
  }
  public editTotalLine(line: CardTotalLineDTO, index: number): void {
    this.customDialogService
      .open({
        component: CardPaymentDialogFormComponent,
        extendedComponentData: {
          total: line,
          paymentTypes: [],
          paymentStatus: [],
          cardInstancePaymentDTO: { id: this.data?.id ? this.data.id : null },
          attachmentsList: this.attachmentsList,
          cardInstanceWorkflowId: this.cardInstanceWorkflowId,
          mode: 'TOTAL'
        },
        id: CardPaymentDialogEnum.ID,
        panelClass: CardPaymentDialogEnum.PANEL_CLASS,
        disableClose: true,
        width: '900px'
      })
      .pipe(take(1))
      .subscribe((response) => {
        if (response) {
          this.saveTotalLine(response);
        }
      });
  }
  public editTotal(): void {
    if (!this.editingTotal) {
      this.prevTotal = this.formTotal.get('total').value;
      this.editingTotal = true;
    }
  }
  public editAccount(): void {
    if (!this.editingAccount) {
      this.prevTotal = this.formTotal.get('customerAccount').value;
      this.editingAccount = true;
    }
  }
  public paymentDisabled(payment: FormGroup): boolean {
    return !payment.value.editMode;
  }
  public newTotalLine() {
    this.customDialogService
      .open({
        component: CardPaymentDialogFormComponent,
        extendedComponentData: {
          payment: null,
          total: null,
          paymentTypes: [],
          paymentStatus: [],
          attachmentsList: this.attachmentsList,
          cardInstancePaymentDTO: { id: this.data?.id ? this.data.id : null },
          mode: 'TOTAL'
        },
        id: CardPaymentDialogEnum.ID,
        panelClass: CardPaymentDialogEnum.PANEL_CLASS,
        disableClose: true,
        width: '900px'
      })
      .pipe(take(1))
      .subscribe((response) => {
        if (response) {
          console.log(response);
          this.saveTotalLine(response);
        }
      });
  }
  public newLine() {
    this.customDialogService
      .open({
        component: CardPaymentDialogFormComponent,
        extendedComponentData: {
          payment: null,
          total: null,
          paymentTypes: this.paymentTypes,
          paymentStatus: this.paymentStatus,
          attachmentsList: this.attachmentsList,
          cardInstancePaymentDTO: { id: this.data?.id ? this.data.id : null },
          mode: 'PAYMENT'
        },
        id: CardPaymentDialogEnum.ID,
        panelClass: CardPaymentDialogEnum.PANEL_CLASS,
        disableClose: true,
        width: '900px'
      })
      .pipe(take(1))
      .subscribe((response) => {
        if (response) {
          console.log(response);
          this.savePayment(response);
        }
      });
  }
  public initializeForms() {
    this.formTotal = this.fb.group({
      id: [this.data?.id ? this.data?.id : null],
      cardInstance: [
        this.data?.cardInstance ? this.data?.cardInstance : { id: this.cardInstanceWorkflowId },
        [Validators.required]
      ],
      tab: [this.data?.tab ? this.data?.tab : { id: this.tabId }, [Validators.required]],
      total: [this.data?.total ? this.data?.total : null, [Validators.max(this.maxAmount), Validators.required]],
      customerAccount: [this.data?.customerAccount ? this.data?.customerAccount : null],
      pending: [this.data?.pending ? this.data?.pending : null]
    });
  }
  ngOnInit(): void {
    this.totalLines = this.data?.paymentTotals?.length ? this.data.paymentTotals : [];
    this.paymentLines = this.data?.paymentLines?.length ? this.data.paymentLines : [];
    this.paymentLines = this.paymentLines.map((line, index) => ({
      ...line,
      paymentStatus: line?.paymentStatus ? line.paymentStatus : { id: 1, name: 'Creada' }
    }));
    const resquests = [
      this.attachmentService.getCardAttachmentsByInstance(this.cardInstanceWorkflowId).pipe(take(1)),
      this.paymentsService.getCardPaymentTypes().pipe(take(1)),
      this.paymentsService.getCardPaymentStatus().pipe(take(1))
    ];
    forkJoin(resquests).subscribe(
      (responses: [CardAttachmentsDTO[], PaymentTypeDTO[], PaymentTypeDTO[]]) => {
        this.paymentTypes = responses[1];
        this.paymentStatus = responses[2];
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
