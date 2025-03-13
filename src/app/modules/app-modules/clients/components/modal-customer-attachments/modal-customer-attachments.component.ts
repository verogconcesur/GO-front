import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { ConfigEntityCardAttachmentsDTO, CustomerAttachmentDTO } from '@data/models/cards/card-attachments-dto';
import { CustomDialogFooterConfigI } from '@shared/modules/custom-dialog/interfaces/custom-dialog-footer-config';
import { ComponentToExtendForCustomDialog } from '@shared/modules/custom-dialog/models/component-for-custom-dialog';
// eslint-disable-next-line max-len
import { PermissionConstants } from '@app/constants/permission.constants';
// eslint-disable-next-line max-len
import CardInstanceAttachmentsConfig from '@modules/feature-modules/card-instance-attachments/card-instance-attachments-config-interface';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { Observable, of } from 'rxjs';

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
    activeAttachments: marker('entities.customers.activeAttachments'),
    oldAttachments: marker('entities.customers.oldAttachments')
  };
  public clientId: number = null;
  public configTab1: CardInstanceAttachmentsConfig;
  public configTab2: CardInstanceAttachmentsConfig;
  public attachmentsDataTab1: ConfigEntityCardAttachmentsDTO[] = [];
  public attachmentsDataTab2: ConfigEntityCardAttachmentsDTO[] = [];
  private apiUrl = 'https://concenet-dev.sdos.es/concenet-rest/api/customers/693/attachments';

  constructor(
    private fb: UntypedFormBuilder,
    private spinnerService: ProgressSpinnerDialogService,
    private confirmDialogService: ConfirmDialogService,
    private translateService: TranslateService,
    private globalMessageService: GlobalMessageService,
    private httpClient: HttpClient
  ) {
    super(
      editCustomerAttachmentsComponentModalEnum.ID,
      editCustomerAttachmentsComponentModalEnum.PANEL_CLASS,
      editCustomerAttachmentsComponentModalEnum.TITLE
    );
  }
  ngOnInit(): void {
    this.fetchAttachments();
    this.clientId = this.extendedComponentData;
    console.log(this.clientId);
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

    this.httpClient.get<CustomerAttachmentDTO[]>(this.apiUrl).subscribe(
      (data) => {
        this.spinnerService.hide(spinner);
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
      (error) => {
        this.spinnerService.hide(spinner);
        console.error('Error fetching attachments', error);
      }
    );
  }

  onTabChange(event: MatTabChangeEvent) {
    console.log('Selected tab index: ', event.index);
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
