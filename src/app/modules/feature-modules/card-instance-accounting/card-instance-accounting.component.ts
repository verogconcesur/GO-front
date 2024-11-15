/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { AttachmentDTO, CardAttachmentsDTO, CardInstanceAttachmentDTO } from '@data/models/cards/card-attachments-dto';
// eslint-disable-next-line max-len
import { PermissionConstants } from '@app/constants/permission.constants';
import { AuthenticationService } from '@app/security/authentication.service';
import { ConcenetError } from '@app/types/error';
import { CardAccountingBlockDTO, CardAccountingDTO, CardAccountingLineDTO } from '@data/models/cards/card-accounting-dto';
import CardInstanceDTO from '@data/models/cards/card-instance-dto';
import { AccountingTaxTypeDTO } from '@data/models/templates/templates-accounting-dto';
import { CardAccountingService } from '@data/services/card-accounting.service';
import { CardAttachmentsService } from '@data/services/card-attachments.service';
import { TemplatesAccountingsService } from '@data/services/templates-accountings.service';
import { TranslateService } from '@ngx-translate/core';
import { CustomDialogService } from '@shared/modules/custom-dialog/services/custom-dialog.service';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { finalize, take } from 'rxjs/operators';
import {
  CardAccountingDialogFormComponent,
  CardAccoutingDialogEnum
} from './card-accounting-dialog-form/card-accounting-dialog-form.component';
import CardInstanceAccountingConfig from './card-instance-accounting-config-interface';

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
    taxType: marker('cardDetail.accounting.taxType'),
    line: marker('common.line'),
    amount: marker('common.amount'),
    total: marker('common.total'),
    okClient: marker('common.okClient'),
    newLine: marker('cardDetail.accounting.newLine'),
    type: marker('common.type'),
    generalInfo: marker('cardDetail.payments.generalInfo'),
    value: marker('common.value'),
    totalTax: marker('cardDetail.accounting.totalTax'),
    totalAmountPlusTax: marker('cardDetail.accounting.totalAmountPlusTax'),
    actions: marker('common.actions'),
    lock: marker('cardDetail.accounting.block'),
    unlock: marker('cardDetail.accounting.unblock')
  };

  public taxTypes: AccountingTaxTypeDTO[] = [
    {
      id: null,
      description: marker('cardDetail.accounting.taxTypeNoApply'),
      value: null
    }
  ];
  public taxTypeToApply: AccountingTaxTypeDTO = this.taxTypes[0];
  public editingTaxType = false;
  public attachmentsList: CardInstanceAttachmentDTO[] = [];
  public accumulatedLineSelected: CardAccountingLineDTO = null;

  constructor(
    private accountingService: CardAccountingService,
    private translateService: TranslateService,
    private confirmationDialog: ConfirmDialogService,
    private globalMessageService: GlobalMessageService,
    private customDialogService: CustomDialogService,
    private attachmentService: CardAttachmentsService,
    private templateAccountingsService: TemplatesAccountingsService,
    private spinnerService: ProgressSpinnerDialogService,
    private authService: AuthenticationService
  ) {}

  ngOnInit(): void {
    const spinner = this.spinnerService.show();
    this.attachmentService
      .getCardAttachmentsByInstance(this.cardInstanceWorkflowId)
      .pipe(take(1))
      .subscribe({
        next: (data: CardAttachmentsDTO[]) => {
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
          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
        }
      });
    this.templateAccountingsService
      .getListTaxTypes()
      .pipe(
        take(1),
        finalize(() => this.spinnerService.hide(spinner))
      )
      .subscribe({
        next: (data: AccountingTaxTypeDTO[]) => {
          this.taxTypes = [...this.taxTypes, ...data];
          if (this.data.taxType) {
            this.taxTypeToApply = this.taxTypes.find((type) => this.data.taxType.id === type.id);
          }
        },
        error: (error: ConcenetError) => {
          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
        }
      });
  }

  public canBlockAccounting(): boolean {
    return this.authService.hasUserAnyPermission([PermissionConstants.LOCKACCOUNTING]);
  }

  public disableEnableAccpuntingTab() {
    let disabled: number;
    if (this.data.locked) {
      disabled = 0;
    } else {
      disabled = 1;
    }
    const spinner = this.spinnerService.show();
    this.accountingService
      .disableEnableAccpuntingTab(this.cardInstanceWorkflowId, this.tabId, disabled)
      .pipe(
        take(1),
        finalize(() => this.spinnerService.hide(spinner))
      )
      .subscribe({
        next: (data: any) => {
          this.reload.emit(true);
        },
        error: (error: ConcenetError) => {
          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
        }
      });
  }

  public setTaxType(): void {
    const spinner = this.spinnerService.show();
    this.accountingService
      .setTaxType(this.cardInstanceWorkflowId, this.tabId, this.taxTypeToApply)
      .pipe(
        take(1),
        finalize(() => this.spinnerService.hide(spinner))
      )
      .subscribe({
        next: (data: any) => {
          this.data = data;
        },
        error: (error: ConcenetError) => {
          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
          this.reload.emit(true);
        }
      });
  }

  public editTaxType(): void {
    if (!this.editingTaxType) {
      this.editingTaxType = true;
    }
  }

  public editBlock(block: CardAccountingBlockDTO): void {
    this.customDialogService
      .open({
        component: CardAccountingDialogFormComponent,
        extendedComponentData: {
          line: null,
          taxType: this.taxTypeToApply,
          block: JSON.parse(JSON.stringify(block)),
          attachmentsList: this.attachmentsList,
          cardInstanceWorkflowId: this.cardInstanceWorkflowId,
          tabId: this.tabId,
          editionDisabled: this.cardInstanceAccountingConfig.disableAccountingEdition,
          isTabDisabled: this.data.locked,
          mode: 'BLOCK'
        },
        id: CardAccoutingDialogEnum.ID,
        panelClass: CardAccoutingDialogEnum.PANEL_CLASS,
        disableClose: true,
        width: '500px'
      })
      .pipe(take(1))
      .subscribe((response) => {
        if (response) {
          this.globalMessageService.showSuccess({
            message: this.translateService.instant(marker('common.success')),
            actionText: this.translateService.instant(marker('common.close'))
          });
          this.reload.emit(true);
        }
      });
  }

  public editLine(line: CardAccountingLineDTO): void {
    if ((line.templateAccountingItemLine.taxApply && this.taxTypeToApply.id) || !line.templateAccountingItemLine.taxApply) {
      this.customDialogService
        .open({
          component: CardAccountingDialogFormComponent,
          extendedComponentData: {
            line: JSON.parse(JSON.stringify(line)),
            taxType: this.taxTypeToApply,
            block: null,
            attachmentsList: this.attachmentsList,
            cardInstanceWorkflowId: this.cardInstanceWorkflowId,
            tabId: this.tabId,
            editionDisabled: this.cardInstanceAccountingConfig.disableAccountingEdition,
            isTabDisabled: this.data.locked,
            mode: 'LINE'
          },
          id: CardAccoutingDialogEnum.ID,
          panelClass: CardAccoutingDialogEnum.PANEL_CLASS,
          disableClose: true,
          width: '500px'
        })
        .pipe(take(1))
        .subscribe((response) => {
          if (response) {
            this.globalMessageService.showSuccess({
              message: this.translateService.instant(marker('common.success')),
              actionText: this.translateService.instant(marker('common.close'))
            });
            this.reload.emit(true);
          }
        });
    } else {
      this.globalMessageService.showError({
        message: this.translateService.instant(marker('errors.requiredIVA')),
        actionText: this.translateService.instant(marker('common.close'))
      });
    }
  }

  public hasTaxApplyOrExempt(block?: CardAccountingBlockDTO): boolean {
    if (this.taxTypeToApply?.id === 40) {
      return false;
    }
    return block.accountingLines?.some((line) => line.templateAccountingItemLine?.taxApply);
  }

  public compareTax(object1: AccountingTaxTypeDTO, object2: AccountingTaxTypeDTO) {
    return object1 && object2 && object1.id === object2.id;
  }

  // public showAccumulated(line: CardAccountingLineDTO): void {
  //   if (this.accumulatedLineSelected === line) {
  //     this.accumulatedLineSelected = null;
  //     return;
  //   }
  //   this.accumulatedLineSelected = line;
  // }

  // public getFontColorAccumulatedLine(line: CardAccountingLineDTO): string {
  //   return line === this.accumulatedLineSelected ? 'green' : '#4746a3';
  // }
}
