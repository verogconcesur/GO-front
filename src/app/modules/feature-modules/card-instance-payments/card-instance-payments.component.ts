import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { AttachmentDTO, CardAttachmentsDTO, CardPaymentAttachmentsDTO } from '@data/models/cards/card-attachments-dto';
import { CardPaymentLineDTO, CardPaymentsDTO } from '@data/models/cards/card-payments-dto';
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

@Component({
  selector: 'app-card-instance-payments',
  templateUrl: './card-instance-payments.component.html',
  styleUrls: ['./card-instance-payments.component.scss']
})
export class CardInstancePaymentsComponent implements OnInit {
  @Input() cardInstancePaymentsConfig: CardInstancePaymentsConfig;
  @Input() data: CardPaymentsDTO[] = [];
  @Input() cardInstanceWorkflowId: number = null;
  @Input() tabId: number = null;
  @Input() cardInstance: CardInstanceDTO;
  @Output() reload: EventEmitter<boolean> = new EventEmitter<boolean>();
  public labels = {
    okClient: marker('common.okClient'),
    line: marker('common.line'),
    amount: marker('common.amount'),
    actions: marker('common.actions'),
    newLine: marker('common.newLine'),
    send: marker('common.send'),
    attachments: marker('common.attachments'),
    deleteConfirmation: marker('common.deleteConfirmation'),
    maxLengthError: marker('errors.maxLengthError')
  };
  public formPayments: FormArray;
  public currentPayment: CardPaymentsDTO;
  public paymentLines: CardPaymentLineDTO[];
  public attachmentsList: CardPaymentAttachmentsDTO[];
  public editing = false;
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
  public editPayment(payment: FormGroup): void {
    this.editing = true;
    this.currentPayment = payment.getRawValue();
    payment.get('editMode').setValue(true);
  }
  public paymentDisabled(payment: FormGroup): boolean {
    return !payment.value.editMode;
  }
  public newLine() {
    this.editing = true;
    this.formPayments.push(
      this.fb.group({
        id: [null],
        accepted: [false],
        amount: ['', [Validators.max(this.maxAmount), Validators.required]],
        description: ['', Validators.required],
        editMode: [true],
        workflowId: [this.cardInstancePaymentsConfig.workflowId],
        attachments: [],
        attachmentsOriginal: []
      })
    );
  }
  public initializeForms() {
    this.formPayments = this.fb.array([]);
    if (this.data && this.data.length) {
      this.data.forEach((data: CardPaymentsDTO) => {
        this.formPayments.push(
          this.fb.group({
            id: [data.id]
            // amount: [data.amount, Validators.required],
            // description: [data.description, [Validators.max(this.maxAmount), Validators.required]],
            // editMode: [false],
            // workflowId: [data.workflowId],
            // attachments: [data.attachments],
            // attachmentsOriginal: [data.attachments]
          })
        );
      });
    }
  }
  ngOnInit(): void {
    this.data = this.data ? this.data : [];
    this.paymentsService
      .getCardPayments(this.cardInstanceWorkflowId, this.tabId)
      .pipe(take(1))
      .subscribe(
        (data) => {
          this.paymentLines = data.paymentsLines;
        },
        (error: ConcenetError) => {
          this.logger.error(error);
          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
        }
      );
    this.attachmentService
      .getCardAttachmentsByInstance(this.cardInstanceWorkflowId)
      .pipe(take(1))
      .subscribe(
        (data) => {
          this.attachmentsList = [];
          data.forEach((attachment: CardAttachmentsDTO) => {
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
