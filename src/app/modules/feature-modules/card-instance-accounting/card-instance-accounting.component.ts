/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormGroup } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { CardInstanceAttachmentDTO } from '@data/models/cards/card-attachments-dto';
// eslint-disable-next-line max-len
import CardInstanceDTO from '@data/models/cards/card-instance-dto';
import { CardAttachmentsService } from '@data/services/card-attachments.service';
import { CardAccountingService } from '@data/services/card-accounting.service';
import { CardMessagesService } from '@data/services/card-messages.service';
import { CustomDialogService } from '@frontend/custom-dialog';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { NGXLogger } from 'ngx-logger';
import { finalize, take } from 'rxjs/operators';
import CardInstanceAccountingConfig from './card-instance-accounting-config-interface';
import {
  CardAccountingLineDialogFormComponent,
  CardAccountingLineFormComponentModalEnum
} from './card-accounting-line-dialog-form/card-accounting-line-dialog-form.component';
import { CardAccountingDTO } from '@data/models/cards/card-accounting-dto';
import { TemplatesAccountingsService } from '@data/services/templates-accountings.service';
import { ConcenetError } from '@app/types/error';
import { AccountingTaxTypeDTO } from '@data/models/templates/templates-accounting-dto';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';

@Component({
  selector: 'app-card-instance-accounting',
  templateUrl: './card-instance-accounting.component.html',
  styleUrls: ['./card-instance-accounting.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CardInstanceAccountingComponent implements OnInit {
  @Input() cardInstanceAccountingConfig: CardInstanceAccountingConfig;
  @Input() data: CardAccountingDTO;
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
    pendingDescription: marker('cardDetail.accounting.pendingAmount'),
    customerAccount: marker('cardDetail.accounting.customerAccount'),
    state: marker('common.state'),
    actions: marker('common.actions'),
    paymentLine: marker('cardDetail.accounting.paymentLine'),
    paymentTotalDetail: marker('cardDetail.accounting.paymentTotalDetail'),
    newLine: marker('cardDetail.accounting.newLine'),
    newTotalLine: marker('cardDetail.accounting.newTotalLine'),
    newTotalDetail: marker('cardDetail.accounting.newTotalDetail'),
    send: marker('common.send'),
    sendPayment: marker('cardDetail.accounting.send'),
    resendPayment: marker('cardDetail.accounting.resend'),
    attachments: marker('common.attachments'),
    deleteConfirmation: marker('common.deleteConfirmation'),
    maxLengthError: marker('errors.maxLengthError'),
    value: marker('common.value'),
    generalInfo: marker('cardDetail.accounting.generalInfo'),
    totals: marker('cardDetail.accounting.totals'),
    summation: marker('cardDetail.accounting.summation'),
    summationPayed: marker('cardDetail.accounting.summationPayed'),
    summationPending: marker('cardDetail.accounting.summationPending')
  };

  public taxTypes: AccountingTaxTypeDTO[] = [];

  public formTotal: FormGroup;
  public paymentLines: any[];
  public totalLines: any[];
  public totalDetailLines: any[];
  public paymentStatus: any[];
  public paymentDescriptions: any;
  public attachmentsList: CardInstanceAttachmentDTO[];
  public paymentTypes: any[];
  public prevTotal: number;
  public prevCustomerAccount: string;
  public editing = false;
  public editingTotal = false;
  public editingAccount = false;
  public maxAmount = 99999999;
  constructor(
    private fb: FormBuilder,
    private accountingService: CardAccountingService,
    private logger: NGXLogger,
    private translateService: TranslateService,
    private confirmationDialog: ConfirmDialogService,
    private globalMessageService: GlobalMessageService,
    private customDialogService: CustomDialogService,
    private attachmentService: CardAttachmentsService,
    private cardMessageService: CardMessagesService,
    private templateAccountingsService: TemplatesAccountingsService,
    private spinnerService: ProgressSpinnerDialogService
  ) {}

  ngOnInit(): void {
    const spinner = this.spinnerService.show();
    this.templateAccountingsService
      .getListTaxTypes()
      .pipe(
        take(1),
        finalize(() => this.spinnerService.hide(spinner))
      )
      .subscribe({
        next: (data: AccountingTaxTypeDTO[]) => {
          this.taxTypes = data;
          console.log(this.data, this.taxTypes);
        },
        error: (error: ConcenetError) => {
          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
        }
      });
  }

  public compareAttachments(object1: CardInstanceAttachmentDTO, object2: CardInstanceAttachmentDTO) {
    return object1 && object2 && object1.id === object2.file.id;
  }

  public saveTotalDetail(totalDetail: UntypedFormGroup): void {
    this.confirmationDialog
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('cardDetail.accounting.saveTotalDetailConfirmation'))
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
          // this.accountingService
          //   .addEditTotalDetail(this.cardInstanceWorkflowId, this.tabId, totalDetailData)
          //   .pipe(take(1))
          //   .subscribe(
          //     (data) => {
          //       this.reload.emit(true);
          //     },
          //     (error: ConcenetError) => {
          //       this.logger.error(error);

          //       this.globalMessageService.showError({
          //         message: error.message,
          //         actionText: this.translateService.instant(marker('common.close'))
          //       });
          //     }
          //   );
        }
      });
  }
  public savePayment(payment: UntypedFormGroup): void {
    this.confirmationDialog
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('cardDetail.accounting.saveConfirmation'))
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
          // this.accountingService
          //   .addEditLine(this.cardInstanceWorkflowId, this.tabId, paymentData)
          //   .pipe(take(1))
          //   .subscribe(
          //     (data) => {
          //       this.reload.emit(true);
          //     },
          //     (error: ConcenetError) => {
          //       this.logger.error(error);

          //       this.globalMessageService.showError({
          //         message: error.message,
          //         actionText: this.translateService.instant(marker('common.close'))
          //       });
          //     }
          //   );
        }
      });
  }
  public deletePayment(payment: any, index: number): void {
    this.confirmationDialog
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('cardDetail.accounting.deleteConfirmation'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          // this.accountingService
          //   .deleteLine(this.cardInstanceWorkflowId, this.tabId, payment.id)
          //   .pipe(take(1))
          //   .subscribe(
          //     (data) => {
          //       this.reload.emit(true);
          //     },
          //     (error: ConcenetError) => {
          //       this.logger.error(error);
          //       this.globalMessageService.showError({
          //         message: error.message,
          //         actionText: this.translateService.instant(marker('common.close'))
          //       });
          //     }
          //   );
        }
      });
  }
  public saveTotal(): void {
    if (this.formTotal.get('total').dirty && this.formTotal.get('total').touched) {
      this.confirmationDialog
        .open({
          title: this.translateService.instant(marker('common.warning')),
          message: this.translateService.instant(marker('cardDetail.accounting.saveTotalConfirmation'))
        })
        .pipe(take(1))
        .subscribe((ok: boolean) => {
          if (ok) {
            // this.accountingService
            //   .saveTotal(this.cardInstanceWorkflowId, this.tabId, this.formTotal.getRawValue())
            //   .pipe(take(1))
            //   .subscribe(
            //     () => {
            //       this.reload.emit(true);
            //     },
            //     (error: ConcenetError) => {
            //       this.logger.error(error);
            //       this.globalMessageService.showError({
            //         message: error.message,
            //         actionText: this.translateService.instant(marker('common.close'))
            //       });
            //     }
            //   );
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
        message: this.translateService.instant(marker('cardDetail.accounting.saveTotalLineConfirmation'))
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
          // this.accountingService
          //   .addEditTotalLine(this.cardInstanceWorkflowId, this.tabId, totalLineData)
          //   .pipe(take(1))
          //   .subscribe(
          //     (data) => {
          //       this.reload.emit(true);
          //     },
          //     (error: ConcenetError) => {
          //       this.logger.error(error);

          //       this.globalMessageService.showError({
          //         message: error.message,
          //         actionText: this.translateService.instant(marker('common.close'))
          //       });
          //     }
          //   );
        }
      });
  }

  public saveCustomerAccount(): void {
    if (this.formTotal.get('customerAccount').dirty && this.formTotal.get('customerAccount').touched) {
      this.confirmationDialog
        .open({
          title: this.translateService.instant(marker('common.warning')),
          message: this.translateService.instant(marker('cardDetail.accounting.saveCustomerAccountConfirmation'))
        })
        .pipe(take(1))
        .subscribe((ok: boolean) => {
          if (ok) {
            // this.accountingService
            //   .saveCustomerAccount(this.cardInstanceWorkflowId, this.tabId, this.formTotal.getRawValue())
            //   .pipe(take(1))
            //   .subscribe(
            //     () => {
            //       this.reload.emit(true);
            //     },
            //     (error: ConcenetError) => {
            //       this.logger.error(error);
            //       this.globalMessageService.showError({
            //         message: error.message,
            //         actionText: this.translateService.instant(marker('common.close'))
            //       });
            //     }
            //   );
          } else {
            this.formTotal.get('customerAccount').setValue(this.prevCustomerAccount);
            this.editingAccount = false;
          }
        });
    } else {
      this.editingAccount = false;
    }
  }
  public editPayment(payment: any, index: number): void {
    this.customDialogService
      .open({
        component: CardAccountingLineDialogFormComponent,
        extendedComponentData: {
          payment,
          paymentTypes: this.paymentTypes,
          paymentStatus: this.paymentStatus,
          paymentDescriptions: this.paymentDescriptions,
          attachmentsList: this.attachmentsList,
          editionDisabled: this.cardInstanceAccountingConfig.disableAccountingAdditionAction,
          cardInstanceWorkflowId: this.cardInstanceWorkflowId,
          mode: 'PAYMENT'
        },
        id: CardAccountingLineFormComponentModalEnum.ID,
        panelClass: CardAccountingLineFormComponentModalEnum.PANEL_CLASS,
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
  public editTotalLine(line: any, index: number): void {
    this.customDialogService
      .open({
        component: CardAccountingLineDialogFormComponent,
        extendedComponentData: {
          total: line,
          paymentTypes: [],
          paymentStatus: [],
          paymentDescriptions: this.paymentDescriptions,
          attachmentsList: this.attachmentsList,
          cardInstanceWorkflowId: this.cardInstanceWorkflowId,
          editionDisabled: this.cardInstanceAccountingConfig.disableAccountingAdditionAction,
          mode: 'TOTAL'
        },
        id: CardAccountingLineFormComponentModalEnum.ID,
        panelClass: CardAccountingLineFormComponentModalEnum.PANEL_CLASS,
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
  public editTotalDetailLine(line: any, index: number): void {
    this.customDialogService
      .open({
        component: CardAccountingLineDialogFormComponent,
        extendedComponentData: {
          totalDetail: line,
          paymentTypes: [],
          paymentStatus: [],
          paymentDescriptions: this.paymentDescriptions,
          attachmentsList: this.attachmentsList,
          cardInstanceWorkflowId: this.cardInstanceWorkflowId,
          editionDisabled: this.cardInstanceAccountingConfig.disableAccountingAdditionAction,
          mode: 'TOTAL_DETAIL'
        },
        id: CardAccountingLineFormComponentModalEnum.ID,
        panelClass: CardAccountingLineFormComponentModalEnum.PANEL_CLASS,
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
        component: CardAccountingLineDialogFormComponent,
        extendedComponentData: {
          payment: null,
          total: null,
          totalDetail: null,
          paymentTypes: [],
          paymentStatus: [],
          paymentDescriptions: this.paymentDescriptions,
          attachmentsList: this.attachmentsList,
          editionDisabled: this.cardInstanceAccountingConfig.disableAccountingAdditionAction,
          mode: 'TOTAL'
        },
        id: CardAccountingLineFormComponentModalEnum.ID,
        panelClass: CardAccountingLineFormComponentModalEnum.PANEL_CLASS,
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
        component: CardAccountingLineDialogFormComponent,
        extendedComponentData: {
          payment: null,
          total: null,
          totalDetail: null,
          paymentTypes: [],
          paymentStatus: [],
          paymentDescriptions: this.paymentDescriptions,
          attachmentsList: this.attachmentsList,
          editionDisabled: this.cardInstanceAccountingConfig.disableAccountingAdditionAction,
          mode: 'TOTAL_DETAIL'
        },
        id: CardAccountingLineFormComponentModalEnum.ID,
        panelClass: CardAccountingLineFormComponentModalEnum.PANEL_CLASS,
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
    this.totalLines.forEach((line: any) => {
      total += line.amount * 100;
    });
    if (total) {
      return total / 100;
    }
    return total;
  }
  public getTotalDeatilsSummation(): number {
    let total = 0;
    this.totalDetailLines.forEach((line: any) => {
      total += line.amount * 100;
    });
    if (total) {
      return total / 100;
    }
    return total;
  }

  public getPaymentLinesSummation(type?: 'pending' | 'payed'): number {
    let total = 0;
    this.paymentLines.forEach((line: any) => {
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
        component: CardAccountingLineDialogFormComponent,
        extendedComponentData: {
          payment: null,
          total: null,
          totalDetail: null,
          paymentTypes: this.paymentTypes,
          paymentStatus: this.paymentStatus,
          paymentDescriptions: this.paymentDescriptions,
          attachmentsList: this.attachmentsList,

          editionDisabled: this.cardInstanceAccountingConfig.disableAccountingAdditionAction,
          mode: 'PAYMENT'
        },
        id: CardAccountingLineFormComponentModalEnum.ID,
        panelClass: CardAccountingLineFormComponentModalEnum.PANEL_CLASS,
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
    // this.formTotal = this.fb.group({
    //   id: [this.data?.id ? this.data?.id : null],
    //   cardInstance: [
    //     this.data?.cardInstance ? this.data?.cardInstance : { id: this.cardInstanceWorkflowId },
    //     [Validators.required]
    //   ],
    //   tab: [this.data?.tab ? this.data?.tab : { id: this.tabId }, [Validators.required]],
    //   total: [this.data?.total ? this.data?.total : null, [Validators.max(this.maxAmount), Validators.required]],
    //   customerAccount: [this.data?.customerAccount ? this.data?.customerAccount : null],
    //   pending: [this.data?.pending ? this.data?.pending : null]
    // });
  }
}
