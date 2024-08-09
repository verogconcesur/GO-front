import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { CardAttachmentsDTO } from '@data/models/cards/card-attachments-dto';
import { ComponentToExtendForCustomDialog, CustomDialogFooterConfigI } from '@frontend/custom-dialog';
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
  public configTab1: CardInstanceAttachmentsConfig;
  public configTab2: CardInstanceAttachmentsConfig;
  public attachmentsDataTab1: CardAttachmentsDTO[] = [];
  public attachmentsDataTab2: CardAttachmentsDTO[] = [];
  private apiUrl = 'https://concenet-dev.sdos.es/concenet-rest/api/cardInstanceWorkflow/detail/1846/attachments/11';

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
    this.configTab1 = {
      tabId: 1,
      wcId: 1,
      permission: 'EDIT',
      disableAttachmentsSelection: false,
      disableLandingAction: false,
      disableEditFileName: true,
      disableIndividualDeleteAction: false,
      disableAttachmentsAddition: false
    };

    this.configTab2 = {
      tabId: 2,
      wcId: 2,
      permission: 'EDIT',
      disableAttachmentsSelection: false,
      disableLandingAction: false,
      disableEditFileName: true,
      disableIndividualDeleteAction: false,
      disableAttachmentsAddition: true
    };
  }
  ngOnDestroy(): void {}

  fetchAttachments(): void {
    this.attachmentsDataTab1 = [];
    this.attachmentsDataTab2 = [];
    const spinner = this.spinnerService.show();
    this.httpClient.get<CardAttachmentsDTO[]>(this.apiUrl).subscribe(
      (data) => {
        this.spinnerService.hide(spinner);
        this.attachmentsDataTab1 = data;
        this.attachmentsDataTab2 = data;
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
