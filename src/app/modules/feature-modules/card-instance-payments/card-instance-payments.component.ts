import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormGroup, Validators } from '@angular/forms';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { AttachmentDTO, CardAttachmentsDTO, CardInstanceAttachmentDTO } from '@data/models/cards/card-attachments-dto';
// eslint-disable-next-line max-len
import { ModulesConstants } from '@app/constants/modules.constants';
import { AuthenticationService } from '@app/security/authentication.service';
import CardInstanceDTO from '@data/models/cards/card-instance-dto';
import {
  CardPaymentLineDTO,
  CardPaymentsDTO,
  CardTotalDetailDTO,
  CardTotalLineDTO,
  PaymentPosibleDescriptionDTO,
  PaymentStatusDTO,
  PaymentTypeDTO
} from '@data/models/cards/card-payments-dto';
import { CardAttachmentsService } from '@data/services/card-attachments.service';
import { CardMessagesService } from '@data/services/card-messages.service';
import { CardPaymentsService } from '@data/services/card-payments.service';
import { TranslateService } from '@ngx-translate/core';
import { CustomDialogService } from '@shared/modules/custom-dialog/services/custom-dialog.service';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { NGXLogger } from 'ngx-logger';
import { forkJoin } from 'rxjs';
import { take } from 'rxjs/operators';
import CardInstancePaymentsConfig from './card-instance-payments-config-interface';
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
    paymentLine: marker('cardDetail.payments.paymentLine'),
    paymentTotalDetail: marker('cardDetail.payments.paymentTotalDetail'),
    newLine: marker('cardDetail.payments.newLine'),
    newTotalLine: marker('cardDetail.payments.newTotalLine'),
    newTotalDetail: marker('cardDetail.payments.newTotalDetail'),
    send: marker('common.send'),
    sendPayment: marker('cardDetail.payments.send'),
    sendPaymentBySms: marker('cardDetail.payments.sendSms'),
    sendPaymentByEmail: marker('cardDetail.payments.sendEmail'),
    sendPaymentByPepper: marker('cardDetail.payments.sendPepper'),
    resendPayment: marker('cardDetail.payments.resend'),
    attachments: marker('common.attachments'),
    deleteConfirmation: marker('common.deleteConfirmation'),
    maxLengthError: marker('errors.maxLengthError'),
    value: marker('common.value'),
    generalInfo: marker('cardDetail.payments.generalInfo'),
    totals: marker('cardDetail.payments.totals'),
    summation: marker('cardDetail.payments.summation'),
    summationPayed: marker('cardDetail.payments.summationPayed'),
    summationPending: marker('cardDetail.payments.summationPending')
  };
  public formTotal: FormGroup;
  public paymentLines: CardPaymentLineDTO[];
  public totalLines: CardTotalLineDTO[];
  public totalDetailLines: CardTotalDetailDTO[];
  public paymentStatus: PaymentStatusDTO[];
  public paymentDescriptions: PaymentPosibleDescriptionDTO;
  public attachmentsList: CardInstanceAttachmentDTO[];
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
    private cardMessageService: CardMessagesService,
    private authenticationService: AuthenticationService
  ) {}
  public compareAttachments(object1: CardInstanceAttachmentDTO, object2: CardInstanceAttachmentDTO) {
    return object1 && object2 && object1.file.id === object2.file.id;
  }
  public getSendLabel(payment: CardPaymentLineDTO): string {
    if (payment.paymentStatus.id === 1) {
      return this.labels.sendPayment;
    } else {
      return this.labels.resendPayment;
    }
  }

  public getSendLabelBySmsOrEmail(payment: CardPaymentLineDTO): string {
    if (payment.paymentStatus.id === 1 && payment.paymentType.id === 9) {
      return this.labels.sendPaymentBySms;
    } else if (payment.paymentStatus.id === 1 && payment.paymentType.id === 10) {
      return this.labels.sendPaymentByEmail;
    }
  }

  public getSendLabelByPepper(payment: CardPaymentLineDTO): string {
    if (payment.paymentStatus.id === 1 && payment.paymentType.id === 11) {
      return this.labels.sendPaymentBySms;
    }
  }

  public isContractedModule(module: string): boolean {
    const configList = this.authenticationService.getConfigList();
    if (module === 'timeline') {
      return configList.includes(ModulesConstants.TIME_LINE);
    } else if (module === 'pepper') {
      return configList.includes(ModulesConstants.PEPPER);
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

  public sendPaymentByEmailOrSms(payment: CardPaymentLineDTO): void {
    this.confirmationDialog
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message:
          payment.paymentType.id === 9
            ? this.translateService.instant(marker('cardDetail.payments.sendConfirmationBySms'))
            : payment.paymentType.id === 10
            ? this.translateService.instant(marker('cardDetail.payments.sendConfirmationByEmail'))
            : ''
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          this.cardMessageService
            .sendPaymentMessageBySmsOrEmail(this.cardInstanceWorkflowId, this.tabId, payment.id)
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
  public sendPaymentByPepper(payment: CardPaymentLineDTO): void {
    this.confirmationDialog
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('cardDetail.payments.sendConfirmationByPepper'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          this.cardMessageService
            .sendPaymentMessageByPepper(this.cardInstanceWorkflowId, this.tabId, payment.id)
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
  public saveTotalDetail(totalDetail: UntypedFormGroup): void {
    this.confirmationDialog
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('cardDetail.payments.saveTotalDetailConfirmation'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          const totalDetailData = totalDetail.getRawValue();
          if (totalDetailData.attachments?.length) {
            totalDetailData.attachments = totalDetailData.attachments.map((att1: CardInstanceAttachmentDTO) => {
              let attachment = att1;
              if (
                totalDetailData.attachmentsOriginal?.length &&
                totalDetailData.attachmentsOriginal.find((att2: CardInstanceAttachmentDTO) => att1.file.id === att2.file.id)
              ) {
                attachment = totalDetailData.attachmentsOriginal.find(
                  (att2: CardInstanceAttachmentDTO) => att1.file.id === att2.file.id
                );
              }
              return attachment;
            });
          } else {
            totalDetailData.attachments = [];
          }
          this.paymentsService
            .addEditTotalDetail(this.cardInstanceWorkflowId, this.tabId, totalDetailData)
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
            paymentData.attachments = paymentData.attachments.map((att1: CardInstanceAttachmentDTO) => {
              let attachment = att1;
              if (
                paymentData.attachmentsOriginal?.length &&
                paymentData.attachmentsOriginal.find((att2: CardInstanceAttachmentDTO) => att1.file.id === att2.file.id)
              ) {
                attachment = paymentData.attachmentsOriginal.find(
                  (att2: CardInstanceAttachmentDTO) => att1.file.id === att2.file.id
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
            totalLineData.attachments = totalLineData.attachments.map((att1: CardInstanceAttachmentDTO) => {
              let attachment = att1;
              if (
                totalLineData.attachmentsOriginal?.length &&
                totalLineData.attachmentsOriginal.find((att2: CardInstanceAttachmentDTO) => att1.file.id === att2.file.id)
              ) {
                attachment = totalLineData.attachmentsOriginal.find(
                  (att2: CardInstanceAttachmentDTO) => att1.file.id === att2.file.id
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

  public deleteTotalDetailLine(line: CardTotalDetailDTO, index: number): void {
    this.confirmationDialog
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('cardDetail.payments.deleteTotalDetailConfirmation'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          this.paymentsService
            .deleteTotalDetailLine(this.cardInstanceWorkflowId, this.tabId, line.id)
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
          paymentDescriptions: this.paymentDescriptions,
          cardInstancePaymentDTO: { id: this.data?.id ? this.data.id : null },
          attachmentsList: this.attachmentsList,
          editionDisabled: this.cardInstancePaymentsConfig.disablePaymentsAdditionAction,
          cardInstanceWorkflowId: this.cardInstanceWorkflowId,
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
          paymentDescriptions: this.paymentDescriptions,
          cardInstancePaymentDTO: { id: this.data?.id ? this.data.id : null },
          attachmentsList: this.attachmentsList,
          cardInstanceWorkflowId: this.cardInstanceWorkflowId,
          editionDisabled: this.cardInstancePaymentsConfig.disablePaymentsAdditionAction,
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
  public editTotalDetailLine(line: CardTotalDetailDTO, index: number): void {
    this.customDialogService
      .open({
        component: CardPaymentDialogFormComponent,
        extendedComponentData: {
          totalDetail: line,
          paymentTypes: [],
          paymentStatus: [],
          paymentDescriptions: this.paymentDescriptions,
          cardInstancePaymentDTO: { id: this.data?.id ? this.data.id : null },
          attachmentsList: this.attachmentsList,
          cardInstanceWorkflowId: this.cardInstanceWorkflowId,
          editionDisabled: this.cardInstancePaymentsConfig.disablePaymentsAdditionAction,
          mode: 'TOTAL_DETAIL'
        },
        id: CardPaymentDialogEnum.ID,
        panelClass: CardPaymentDialogEnum.PANEL_CLASS,
        disableClose: true,
        width: '900px'
      })
      .pipe(take(1))
      .subscribe((response) => {
        if (response) {
          this.saveTotalDetail(response);
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
          totalDetail: null,
          paymentTypes: [],
          paymentStatus: [],
          paymentDescriptions: this.paymentDescriptions,
          attachmentsList: this.attachmentsList,
          cardInstancePaymentDTO: { id: this.data?.id ? this.data.id : null },
          editionDisabled: this.cardInstancePaymentsConfig.disablePaymentsAdditionAction,
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
  public newTotalDetail() {
    this.customDialogService
      .open({
        component: CardPaymentDialogFormComponent,
        extendedComponentData: {
          payment: null,
          total: null,
          totalDetail: null,
          paymentTypes: [],
          paymentStatus: [],
          paymentDescriptions: this.paymentDescriptions,
          attachmentsList: this.attachmentsList,
          cardInstancePaymentDTO: { id: this.data?.id ? this.data.id : null },
          editionDisabled: this.cardInstancePaymentsConfig.disablePaymentsAdditionAction,
          mode: 'TOTAL_DETAIL'
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
          this.saveTotalDetail(response);
        }
      });
  }
  public getTotalsSummation(): number {
    let total = 0;
    this.totalLines.forEach((line: CardTotalLineDTO) => {
      total += line.amount * 100;
    });
    if (total) {
      return total / 100;
    }
    return total;
  }
  public getTotalDeatilsSummation(): number {
    let total = 0;
    this.totalDetailLines.forEach((line: CardTotalDetailDTO) => {
      total += line.amount * 100;
    });
    if (total) {
      return total / 100;
    }
    return total;
  }

  public getPaymentLinesSummation(type?: 'pending' | 'payed'): number {
    let total = 0;
    this.paymentLines.forEach((line: CardPaymentLineDTO) => {
      if (type === 'pending' && (line.paymentStatus.id === 1 || line.paymentStatus.id === 2)) {
        total += line.amount * 100;
      } else if (type === 'payed' && line.paymentStatus.id === 3) {
        total += line.amount * 100;
      } else if (!type && (line.paymentStatus.id === 1 || line.paymentStatus.id === 2 || line.paymentStatus.id === 3)) {
        total += line.amount * 100;
      }
    });
    if (total) {
      return total / 100;
    }
    return total;
  }
  public newLine() {
    this.customDialogService
      .open({
        component: CardPaymentDialogFormComponent,
        extendedComponentData: {
          payment: null,
          total: null,
          totalDetail: null,
          paymentTypes: this.paymentTypes,
          paymentStatus: this.paymentStatus,
          paymentDescriptions: this.paymentDescriptions,
          attachmentsList: this.attachmentsList,
          cardInstancePaymentDTO: { id: this.data?.id ? this.data.id : null },
          editionDisabled: this.cardInstancePaymentsConfig.disablePaymentsAdditionAction,
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
    this.totalDetailLines = this.data?.paymentTotalDetails?.length ? this.data.paymentTotalDetails : [];
    this.paymentLines = this.data?.paymentLines?.length ? this.data.paymentLines : [];
    this.paymentLines = this.paymentLines.map((line, index) => ({
      ...line,
      paymentStatus: line?.paymentStatus ? line.paymentStatus : { id: 1, name: 'Creada' }
    }));
    const resquests = [
      this.paymentsService.getCardPaymentTypes().pipe(take(1)),
      this.paymentsService.getCardPaymentStatus().pipe(take(1)),
      this.paymentsService.getCardDesciptionsTypes().pipe(take(1))
    ];

    this.attachmentService
      .getCardAttachmentsByInstance(this.cardInstanceWorkflowId)
      .pipe(take(1))
      .subscribe({
        next: (data: CardAttachmentsDTO[]) => {
          this.attachmentsList = [];
          data.forEach((attachment: CardAttachmentsDTO) => {
            attachment.attachments.forEach((att: AttachmentDTO) => {
              this.attachmentsList.push({
                cardInstance: this.cardInstance,
                tab: { id: attachment.tabId },
                file: att,
                templateAttachmentItem: attachment.templateAttachmentItem
              } as CardInstanceAttachmentDTO);
            });
          });
        },
        error: (error: ConcenetError) => {
          this.attachmentsList = [];
          console.error(error);
        }
      });
    forkJoin(resquests).subscribe(
      (responses: [PaymentTypeDTO[], PaymentTypeDTO[], PaymentPosibleDescriptionDTO]) => {
        this.paymentTypes = responses[0];
        this.paymentStatus = responses[1];
        this.paymentDescriptions = responses[2];
        this.initializeForms();
      },
      (errors) => {
        console.log(errors);
        this.logger.error(errors);
      }
    );
  }
}
