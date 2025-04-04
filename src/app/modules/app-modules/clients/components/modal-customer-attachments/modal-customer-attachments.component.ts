import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { ConfigEntityCardAttachmentsDTO } from '@data/models/cards/card-attachments-dto';
import { CustomDialogFooterConfigI } from '@shared/modules/custom-dialog/interfaces/custom-dialog-footer-config';
import { ComponentToExtendForCustomDialog } from '@shared/modules/custom-dialog/models/component-for-custom-dialog';
// eslint-disable-next-line max-len
import { PermissionConstants } from '@app/constants/permission.constants';
// eslint-disable-next-line max-len
import { ConcenetError } from '@app/types/error';
import { CardAttachmentsService } from '@data/services/card-attachments.service';
// eslint-disable-next-line max-len
import CardInstanceAttachmentsConfig from '@modules/feature-modules/card-instance-attachments/card-instance-attachments-config-interface';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { finalize, Observable, of, take } from 'rxjs';

export const enum editCustomerAttachmentsComponentModalEnum {
  ID = 'modal-customer-attachments-id',
  PANEL_CLASS = 'modal-customer-attachments-dialog',
  TITLE = 'entities.customers.customerAttachments'
}

@Component({
  selector: 'app-modal-customer-attachments',
  templateUrl: './modal-customer-attachments.component.html',
  styleUrls: ['./modal-customer-attachments.component.scss']
})
export class ModalCustomerAttachmentsComponent extends ComponentToExtendForCustomDialog implements OnInit, OnDestroy {
  public labels = {
    activeAttachments: marker('entities.customers.attachments.activeAttachments'),
    oldAttachments: marker('entities.customers.attachments.oldAttachments')
  };
  public clientId: number = null;
  public configTab1: CardInstanceAttachmentsConfig;
  public configTab2: CardInstanceAttachmentsConfig;
  public attachmentsDataTab1: ConfigEntityCardAttachmentsDTO[] = [];
  public attachmentsDataTab2: ConfigEntityCardAttachmentsDTO[] = [];

  constructor(
    private fb: UntypedFormBuilder,
    private spinnerService: ProgressSpinnerDialogService,
    private confirmDialogService: ConfirmDialogService,
    private translateService: TranslateService,
    private globalMessageService: GlobalMessageService,
    private attachmentService: CardAttachmentsService
  ) {
    super(
      editCustomerAttachmentsComponentModalEnum.ID,
      editCustomerAttachmentsComponentModalEnum.PANEL_CLASS,
      editCustomerAttachmentsComponentModalEnum.TITLE
    );
  }
  ngOnInit(): void {
    this.clientId = this.extendedComponentData;
    this.fetchAttachments();
    this.configTab1 = {
      tabId: null,
      wcId: null,
      permission: 'EDIT',
      disableAttachmentsSelection: true,
      disableLandingAction: false,
      disableEditFileName: false,
      disableIndividualDeleteAction: false,
      disableAttachmentsAddition: false
    };

    this.configTab2 = {
      tabId: null,
      wcId: null,
      permission: 'EDIT',
      disableAttachmentsSelection: true,
      disableLandingAction: false,
      disableEditFileName: true,
      disableIndividualDeleteAction: true,
      disableAttachmentsAddition: true
    };
  }
  ngOnDestroy(): void {}

  public fetchAttachments(): void {
    this.attachmentsDataTab1 = [];
    this.attachmentsDataTab2 = [];
    const spinner = this.spinnerService.show();
    this.attachmentService
      .getCustomerAttachments(this.clientId)
      .pipe(
        take(1),
        finalize(() => this.spinnerService.hide(spinner))
      )
      .subscribe({
        next: (data) => {
          const activeAttachments = data.filter((item) => item.active === true);
          const inactiveAttachments = data.filter((item) => item.active === false);

          this.attachmentsDataTab1 = [
            {
              attachments: activeAttachments,
              templateAttachmentItem: {
                id: 0,
                name: '',
                orderNumber: 0
              },
              permissionType: PermissionConstants.EDIT,
              tabId: 0,
              tabName: ''
            }
          ];
          this.attachmentsDataTab2 = [
            {
              attachments: inactiveAttachments,
              templateAttachmentItem: {
                id: 0,
                name: '',
                orderNumber: 0
              },
              permissionType: PermissionConstants.EDIT,
              tabId: 0,
              tabName: ''
            }
          ];
        },
        error: (err: ConcenetError) => {
          this.globalMessageService.showError({
            message: err.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
        }
      });
  }

  onTabChange(event: MatTabChangeEvent) {
    this.fetchAttachments();
  }

  onSubmitCustomDialog(): Observable<boolean> {
    return of(true);
  }
  confirmCloseCustomDialog(): Observable<boolean> {
    return of(true);
  }
  public setAndGetFooterConfig(): CustomDialogFooterConfigI | null {
    return {
      show: true,
      leftSideButtons: [],
      rightSideButtons: []
    };
  }
}
