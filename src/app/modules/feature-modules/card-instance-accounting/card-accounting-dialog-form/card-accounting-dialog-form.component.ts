import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, UntypedFormGroup } from '@angular/forms';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { CardAccountingBlockDTO, CardAccountingLineDTO } from '@data/models/cards/card-accounting-dto';
import { AttachmentDTO, CardInstanceAttachmentDTO } from '@data/models/cards/card-attachments-dto';
import { AccountingTaxTypeDTO } from '@data/models/templates/templates-accounting-dto';
import { CardAccountingService } from '@data/services/card-accounting.service';
import { CardAttachmentsService } from '@data/services/card-attachments.service';
import { MediaViewerService } from '@modules/feature-modules/media-viewer-dialog/media-viewer.service';
import { TranslateService } from '@ngx-translate/core';
import { CustomDialogFooterConfigI } from '@shared/modules/custom-dialog/interfaces/custom-dialog-footer-config';
import { ComponentToExtendForCustomDialog } from '@shared/modules/custom-dialog/models/component-for-custom-dialog';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { Observable, catchError, finalize, of, take } from 'rxjs';

export const enum CardAccoutingDialogEnum {
  ID = 'card-accounting-dialog-id',
  PANEL_CLASS = 'card-accounting-dialog',
  TITLE = 'cardDetail.accountings.newLine'
}

@Component({
  selector: 'app-card-accounting-dialog-form',
  templateUrl: './card-accounting-dialog-form.component.html',
  styleUrls: ['./card-accounting-dialog-form.component.scss']
})
export class CardAccountingDialogFormComponent extends ComponentToExtendForCustomDialog implements OnInit, OnDestroy {
  public line: CardAccountingLineDTO;
  public block: CardAccountingBlockDTO;
  public attachmentsList: CardInstanceAttachmentDTO[] = [];
  public attachmentsSelected: CardInstanceAttachmentDTO[] = [];
  public taxType: AccountingTaxTypeDTO = null;
  public cardInstanceWorkflowId: number;
  public tabId: number;
  public mode: 'BLOCK' | 'LINE' = 'BLOCK';
  public editionDisabled = false;
  public amount = 0;
  public description = '';
  public labels = {
    okClient: marker('common.okClient'),
    description: marker('common.description'),
    amount: marker('common.amount'),
    attachments: marker('common.attachments'),
    attachmentsAssociated: marker('common.attachmentsAssociated'),
    valueBetween: marker('errors.valueBetween'),
    required: marker('errors.required'),
    editLine: marker('cardDetail.accountings.editLine'),
    accumulatedLine: marker('cardDetail.accountings.accumulatedLineEditionBlocked'),
    editBlock: marker('cardDetail.accountings.editBlock')
  };
  public maxAmount = 99999999;
  constructor(
    public fb: FormBuilder,
    public confirmDialogService: ConfirmDialogService,
    public translateService: TranslateService,
    public mediaViewerService: MediaViewerService,
    public cardAttachmentsService: CardAttachmentsService,
    private spinnerService: ProgressSpinnerDialogService,
    private globalMessageService: GlobalMessageService,
    private accountingService: CardAccountingService
  ) {
    super(CardAccoutingDialogEnum.ID, CardAccoutingDialogEnum.PANEL_CLASS, CardAccoutingDialogEnum.TITLE);
  }

  ngOnInit(): void {
    this.line = this.extendedComponentData.line;
    console.log(this.line);
    this.block = this.extendedComponentData.block;
    this.cardInstanceWorkflowId = this.extendedComponentData.cardInstanceWorkflowId;
    this.tabId = this.extendedComponentData.tabId;
    this.taxType = this.extendedComponentData.taxType;
    this.attachmentsList = this.extendedComponentData.attachmentsList;
    this.editionDisabled = this.extendedComponentData.editionDisabled;
    this.mode = this.extendedComponentData.mode ? this.extendedComponentData.mode : 'BLOCK';
    if (this.extendedComponentData.line) {
      this.MODAL_TITLE = this.labels.editLine;
      this.line.attachments = this.line.attachments ? this.line.attachments : [];
      this.amount = this.line.amount;
      this.description = this.line.description;
      this.attachmentsSelected = this.line.attachments ? [...(this.line.attachments as CardInstanceAttachmentDTO[])] : [];
    } else if (this.block) {
      this.MODAL_TITLE = this.labels.editBlock;
      this.block.attachments = this.block.attachments ? this.block.attachments : [];
      this.attachmentsSelected = this.block.attachments ? [...(this.block.attachments as CardInstanceAttachmentDTO[])] : [];
    }
  }

  ngOnDestroy(): void {}

  public areThereChanges(): boolean {
    const newAttch = this.attachmentsSelected
      .map((att) => att.file.id)
      .sort()
      .join(',');
    if (this.mode === 'LINE') {
      const isAmountValid = (amount: number | string): boolean => {
        if (typeof amount === 'string') {
          return amount.trim() !== '' && !isNaN(Number(amount));
        } else if (typeof amount === 'number') {
          return !isNaN(amount);
        }
        return false;
      };
      const originalAttch = this.line.attachments
        .map((att) => (att as CardInstanceAttachmentDTO).file.id)
        .sort()
        .join(',');
      return (
        (this.line.amount !== this.amount && isAmountValid(this.amount) && this.amount >= 0 && this.amount <= this.maxAmount) ||
        (newAttch !== originalAttch && this.amount >= 0 && isAmountValid(this.amount) && this.amount <= this.maxAmount) ||
        (this.description !== this.line.description &&
          this.description !== '' &&
          isAmountValid(this.amount) &&
          this.amount <= this.maxAmount)
      );
    } else {
      const originalAttch = this.block.attachments
        .map((att) => (att as CardInstanceAttachmentDTO).file.id)
        .sort()
        .join(',');
      return newAttch !== originalAttch;
    }
  }

  public compareAttachments(object1: CardInstanceAttachmentDTO, object2: CardInstanceAttachmentDTO) {
    return object1 && object2 && object1.file.id === object2.file.id;
  }

  public openMedia(attachment: CardInstanceAttachmentDTO): void {
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
    if (this.areThereChanges()) {
      return this.confirmDialogService.open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('common.unsavedChangesExit'))
      });
    } else {
      return of(true);
    }
  }

  public onSubmitCustomDialog(): Observable<boolean | UntypedFormGroup> {
    if (this.areThereChanges()) {
      const spinner = this.spinnerService.show();
      if (this.mode === 'LINE') {
        this.line.amount = Number(this.amount);
        this.line.description = this.description;
        this.line.attachments = this.attachmentsSelected;
        this.line.taxType = this.taxType?.id ? this.taxType : null;
        return this.accountingService.editLine(this.cardInstanceWorkflowId, this.tabId, this.line).pipe(
          take(1),
          catchError((error: ConcenetError) => {
            this.globalMessageService.showError({
              message: error.message,
              actionText: this.translateService.instant(marker('common.close'))
            });
            return of(false);
          }),
          finalize(() => this.spinnerService.hide(spinner))
        );
      } else {
        this.block.attachments = this.attachmentsSelected;
        return this.accountingService.editBlock(this.cardInstanceWorkflowId, this.tabId, this.block).pipe(
          take(1),
          catchError((error: ConcenetError) => {
            this.globalMessageService.showError({
              message: error.message,
              actionText: this.translateService.instant(marker('common.close'))
            });
            return of(false);
          }),
          finalize(() => this.spinnerService.hide(spinner))
        );
      }
    } else {
      return of(false);
    }
  }

  public setAndGetFooterConfig(): CustomDialogFooterConfigI | null {
    return {
      show: true,
      leftSideButtons: [
        {
          type: 'close',
          label: marker('common.close'),
          design: 'flat',
          hiddenFn: () => !this.editionDisabled
        }
      ],
      rightSideButtons: [
        {
          type: 'submit',
          label: marker('common.save'),
          design: 'raised',
          color: 'primary',
          hiddenFn: () => this.editionDisabled,
          disabledFn: () => !this.areThereChanges()
        }
      ]
    };
  }
}
