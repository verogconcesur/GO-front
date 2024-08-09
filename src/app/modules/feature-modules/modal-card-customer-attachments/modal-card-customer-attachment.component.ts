import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ComponentToExtendForCustomDialog, CustomDialogFooterConfigI } from '@frontend/custom-dialog';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { Observable, of } from 'rxjs';

export const enum modalCardCustomerAttachmentsComponentModalEnum {
  ID = 'modal-card-customer-attachments-id',
  PANEL_CLASS = 'modal-card-customer-attachments-dialog',
  TITLE = 'entities.customers.customerAttachments'
}
@Component({
  selector: 'app-modal-customer-attachments',
  templateUrl: './modal-card-customer-attachments.component.html',
  styleUrls: ['./modal-card-customer-attachments.component.scss']
})
export class ModalCardCustomerAttachmentsComponent extends ComponentToExtendForCustomDialog implements OnInit, OnDestroy {
  public labels = {};
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
      modalCardCustomerAttachmentsComponentModalEnum.ID,
      modalCardCustomerAttachmentsComponentModalEnum.PANEL_CLASS,
      modalCardCustomerAttachmentsComponentModalEnum.TITLE
    );
  }
  ngOnInit(): void {}
  ngOnDestroy(): void {}

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
