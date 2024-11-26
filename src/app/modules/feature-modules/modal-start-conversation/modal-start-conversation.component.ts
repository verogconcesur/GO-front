import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CardInstanceDTO from '@data/models/cards/card-instance-dto';
import CardInstanceWhatsappDTO from '@data/models/cards/card-instance-whatsapp-dto';
import CustomerEntityDTO from '@data/models/entities/customer-entity-dto';
import TemplatesCommonDTO from '@data/models/templates/templates-common-dto';
import { CardMessagesService } from '@data/services/card-messages.service';
import { EntitiesService } from '@data/services/entities.service';
import { TranslateService } from '@ngx-translate/core';
import { CustomDialogFooterConfigI } from '@shared/modules/custom-dialog/interfaces/custom-dialog-footer-config';
import { ComponentToExtendForCustomDialog } from '@shared/modules/custom-dialog/models/component-for-custom-dialog';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { catchError, finalize, forkJoin, map, Observable, of, take } from 'rxjs';

export const enum StartConversationComponentModalEnum {
  ID = 'start-conversation-dialog-id',
  PANEL_CLASS = 'start-conversation-dialog',
  TITLE = 'startConv.title'
}

@Component({
  selector: 'app-modal-start-conversation',
  templateUrl: './modal-start-conversation.component.html',
  styleUrls: ['./modal-start-conversation.component.scss']
})
export class ModalStartConversationComponent extends ComponentToExtendForCustomDialog implements OnInit, OnDestroy {
  public labels = {
    title: marker('startConv.title'),
    template: marker('startConv.template'),
    phone: marker('startConv.phone'),
    message: marker('startConv.message'),
    required: marker('errors.required')
  };
  public minLength = 3;
  public conversationForm: FormGroup;
  public templateList: TemplatesCommonDTO[];
  public cardInstance: CardInstanceDTO;
  public customer: CustomerEntityDTO;

  constructor(
    private fb: UntypedFormBuilder,
    private spinnerService: ProgressSpinnerDialogService,
    private confirmDialogService: ConfirmDialogService,
    private translateService: TranslateService,
    private globalMessageService: GlobalMessageService,
    private cardMessagesService: CardMessagesService,
    private entitiesService: EntitiesService
  ) {
    super(
      StartConversationComponentModalEnum.ID,
      StartConversationComponentModalEnum.PANEL_CLASS,
      StartConversationComponentModalEnum.TITLE
    );
  }

  // Convenience getter for easy access to form fields
  get form() {
    return this.conversationForm.controls;
  }

  ngOnInit(): void {
    const spinner = this.spinnerService.show();
    this.cardInstance = this.extendedComponentData.cardInstance;
    const resquests = [
      this.cardMessagesService.getMessageTemplates(this.cardInstance.cardInstanceWorkflow.id, [4]).pipe(take(1)),
      this.entitiesService.getCustomerByCardInstance(this.cardInstance.cardInstanceWorkflow.id).pipe(take(1))
    ];
    forkJoin(resquests).subscribe(
      (responses: [TemplatesCommonDTO[], CustomerEntityDTO]) => {
        this.spinnerService.hide(spinner);
        this.templateList = responses[0];
        this.customer = responses[1];
        this.initializeForm();
      },
      (errors) => {
        this.spinnerService.hide(spinner);
        this.globalMessageService.showError({
          message: errors.message,
          actionText: this.translateService.instant(marker('common.close'))
        });
      }
    );
  }

  ngOnDestroy(): void {}

  public confirmCloseCustomDialog(): Observable<boolean> {
    if (this.conversationForm.touched && this.conversationForm.dirty) {
      return this.confirmDialogService.open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('common.unsavedChangesExit'))
      });
    } else {
      return of(true);
    }
  }

  public changeComunicationTemplate() {
    const template = this.conversationForm.get('template').value;
    if (template) {
      const spinner = this.spinnerService.show();
      this.cardMessagesService
        .getMessageClients(this.cardInstance.cardInstanceWorkflow.id, template, [4])
        .pipe(take(1))
        .subscribe({
          next: (res) => {
            this.conversationForm.get('body').setValue(res[0].messageRender);
            this.spinnerService.hide(spinner);
          },
          error: (error) => {
            this.spinnerService.hide(spinner);
            this.globalMessageService.showError({
              message: error.message,
              actionText: this.translateService.instant(marker('common.close'))
            });
          }
        });
    }
  }
  public onSubmitCustomDialog(): Observable<boolean> {
    const formValue = this.conversationForm.value;
    const body: CardInstanceWhatsappDTO = {
      body: formValue.body,
      to: formValue.phone,
      templateId: this.conversationForm.get('template').value
    };
    const spinner = this.spinnerService.show();
    return this.cardMessagesService.sendWhatsappConversation(body, this.cardInstance.cardInstanceWorkflow.id).pipe(
      map(() => {
        this.globalMessageService.showSuccess({
          message: this.translateService.instant(marker('common.successOperation')),
          actionText: this.translateService.instant(marker('common.close'))
        });
        return true;
      }),
      catchError((error) => {
        this.globalMessageService.showError({
          message: error.message,
          actionText: this.translateService.instant(marker('common.close'))
        });
        return of(false);
      }),
      finalize(() => {
        this.spinnerService.hide(spinner);
      })
    );
  }

  public setAndGetFooterConfig(): CustomDialogFooterConfigI | null {
    return {
      show: true,
      leftSideButtons: [],
      rightSideButtons: [
        {
          type: 'submit',
          label: marker('common.send'),
          design: 'raised',
          color: 'primary',
          disabledFn: () => !(this.conversationForm.touched && this.conversationForm.dirty && this.conversationForm.valid)
        }
      ]
    };
  }
  private initializeForm = (): void => {
    this.conversationForm = this.fb.group({
      phone: [this.customer ? this.customer.phone : '', [Validators.required]],
      template: [null, [Validators.required]],
      body: ['', [Validators.required]]
    });
  };
}
