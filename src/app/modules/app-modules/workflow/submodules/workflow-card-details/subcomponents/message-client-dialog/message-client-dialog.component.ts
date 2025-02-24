import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ModulesConstants } from '@app/constants/modules.constants';
import { AuthenticationService } from '@app/security/authentication.service';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { AttachmentDTO, CardAttachmentsDTO } from '@data/models/cards/card-attachments-dto';
import CardInstanceDTO from '@data/models/cards/card-instance-dto';
import CardInstanceRemoteSignatureDTO from '@data/models/cards/card-instance-remote-signature-dto';
import CardMessageRenderDTO from '@data/models/cards/card-message-render';
import MessageChannelDTO from '@data/models/templates/message-channels-dto';
import TemplatesCommonDTO from '@data/models/templates/templates-common-dto';
import { CardAttachmentsService } from '@data/services/card-attachments.service';
import { CardMessagesService } from '@data/services/card-messages.service';
import { TemplatesCommunicationService } from '@data/services/templates-communication.service';
// eslint-disable-next-line max-len
import CardInstanceAttachmentsConfig, {
  CardInstanceAttachmentsModalVersionConfig
} from '@modules/feature-modules/card-instance-attachments/card-instance-attachments-config-interface';
import {
  CardInstanceAttachmentsComponent,
  CardInstanceAttachmentsComponentEnum
} from '@modules/feature-modules/card-instance-attachments/card-instance-attachments.component';
// eslint-disable-next-line max-len
import { TextEditorWrapperConfigI } from '@modules/feature-modules/text-editor-wrapper/interfaces/text-editor-wrapper-config.interface';
import { TranslateService } from '@ngx-translate/core';
import { CustomDialogFooterConfigI } from '@shared/modules/custom-dialog/interfaces/custom-dialog-footer-config';
import { ComponentToExtendForCustomDialog } from '@shared/modules/custom-dialog/models/component-for-custom-dialog';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, finalize, map, take } from 'rxjs/operators';

export const enum MessageClientDialogComponentModalEnum {
  ID = 'message-client-dialog-id',
  PANEL_CLASS = 'message-client-dialog',
  TITLE = 'cards.messages.title'
}
@Component({
  selector: 'app-message-client-dialog',
  templateUrl: './message-client-dialog.component.html',
  styleUrls: ['./message-client-dialog.component.scss']
})
export class MessageClientDialogComponent extends ComponentToExtendForCustomDialog implements OnInit {
  public labels = {
    title: marker('cards.messages.title'),
    chanels: marker('cards.messages.chanels'),
    communicationTemplate: marker('cards.messages.communicationTemplate'),
    insertText: marker('common.insertTextHere'),
    required: marker('errors.required'),
    text: marker('administration.templates.communications.text'),
    subject: marker('administration.templates.communications.subject'),
    attachments: marker('common.attachments'),
    addAttachments: marker('common.addAttachments'),
    confirm: marker('common.confirm')
  };
  public cardInstanceAttachmentsConfig: CardInstanceAttachmentsConfig;
  public attachments: CardAttachmentsDTO[] = [];
  public attachmentsSelected: AttachmentDTO[] = [];
  public textEditorToolbarOptions: TextEditorWrapperConfigI = {
    addHtmlModificationOption: true,
    addMacroListOption: false,
    macroListOptions: []
  };
  public textEditorToolbarOnlyMacroOptions: TextEditorWrapperConfigI = {
    onlyMacroOption: true,
    addMacroListOption: false,
    macroListOptions: []
  };
  public cardInstance: CardInstanceDTO;
  public remoteSignature: CardInstanceRemoteSignatureDTO;
  public messageForm: UntypedFormGroup;
  public messageChannels: MessageChannelDTO[] = [];
  public templateList: TemplatesCommonDTO[] = [];
  constructor(
    private fb: UntypedFormBuilder,
    private spinnerService: ProgressSpinnerDialogService,
    private confirmDialogService: ConfirmDialogService,
    private translateService: TranslateService,
    private communicationService: TemplatesCommunicationService,
    private cardService: CardMessagesService,
    private globalMessageService: GlobalMessageService,
    private cardAttachmentsService: CardAttachmentsService,
    private dialog: MatDialog,
    private authService: AuthenticationService
  ) {
    super(
      MessageClientDialogComponentModalEnum.ID,
      MessageClientDialogComponentModalEnum.PANEL_CLASS,
      MessageClientDialogComponentModalEnum.TITLE
    );
  }
  // Convenience getter for easy access to form fields
  get form() {
    return this.messageForm.controls;
  }
  // get messageChannelsForm() {
  //   return this.messageForm.get('messageChannels') as FormArray;
  // }
  get messageChannelsForm(): FormArray {
    const formArray = this.messageForm.get('messageChannels') as FormArray;
    const filteredChannels = formArray.controls.filter((control) => {
      const messageChannelId = control.value.messageChannel.id;
      const allowSms = !(messageChannelId === 3 && !this.isContractedModule('sms'));
      const allowWhatsapp = !(messageChannelId === 4 && !this.isContractedModule('whatsapp'));
      return allowSms && allowWhatsapp;
    });
    return new FormArray(filteredChannels);
  }
  get messageClientsForm() {
    return this.messageForm.get('messageClients') as FormArray;
  }
  ngOnInit(): void {
    const spinner = this.spinnerService.show();
    this.cardInstance = this.extendedComponentData.cardInstance;
    this.remoteSignature = this.extendedComponentData.remoteSignature;
    forkJoin([
      this.communicationService.getMessageChannels(),
      this.cardAttachmentsService.getCardAttachmentsByInstance(this.cardInstance.cardInstanceWorkflow.id)
    ])
      .pipe(
        take(1),
        finalize(() => this.spinnerService.hide(spinner))
      )
      .subscribe(
        (responses: [MessageChannelDTO[], CardAttachmentsDTO[]]) => {
          this.messageChannels = responses[0];
          this.initializeForm();
          this.attachments = responses[1];
          this.cardInstanceAttachmentsConfig = {
            tabId: null,
            wcId: this.cardInstance.cardInstanceWorkflow.id,
            permission: 'SHOW',
            disableAttachmentsSelection: false,
            disableLandingAction: true,
            disableEditFileName: true,
            disableIndividualDeleteAction: true,
            disableIndividualDownloadAction: true,
            disableAttachmentsAddition: true
          };
        },
        (errors) => {
          console.log(errors);
        }
      );
  }
  public getTitle(): string {
    if (this.remoteSignature) {
      return marker('cards.messages.signatureTitle');
    }
    return this.labels.title;
  }
  public isContractedModule(option: string): boolean {
    const configList = this.authService.getConfigList();
    if (option === 'sms') {
      return configList.includes(ModulesConstants.SMS_SEND);
    } else if (option === 'whatsapp') {
      return configList.includes(ModulesConstants.WHATSAPP_SEND);
    } else if (option === 'customerArea') {
      return configList.includes(ModulesConstants.TIME_LINE);
    }
  }
  public openAttachmentsModal(messageClient: FormGroup): void {
    const data: CardInstanceAttachmentsModalVersionConfig = {
      cardInstanceAttachmentsConfig: this.cardInstanceAttachmentsConfig,
      data: this.attachments,
      selected: messageClient.get('attachments').value ? messageClient.get('attachments').value : [],
      cardInstanceWorkflowId: this.cardInstanceAttachmentsConfig.wcId,
      tabId: null,
      title: marker('common.selectAttacmentsToAdd'),
      confirmButtonLabel: 'common.addAttachments'
    };
    const dialogRef = this.dialog.open(CardInstanceAttachmentsComponent, {
      width: '90%',
      maxWidth: '905px',
      height: '90%',
      panelClass: CardInstanceAttachmentsComponentEnum.PANEL_CLASS,
      disableClose: true,
      data
    });
    dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe((resp: AttachmentDTO[]) => {
        this.attachmentSelected(resp, messageClient);
      });
  }
  public attachmentSelected(attachments: AttachmentDTO[], messageClient: FormGroup): void {
    this.attachmentsSelected = attachments;
    messageClient.get('attachments').setValue([...this.attachmentsSelected].map((item) => ({ id: item.id, name: item.name })));
  }
  public getAttachmentsName(messageClient: FormGroup): string {
    if (messageClient.get('attachments').value?.length) {
      return [...messageClient.get('attachments').value].map((item) => item.name).join(', ');
    }
    return '';
  }
  public selectMessageChannel() {
    this.messageForm.get('comunicationTemplate').setValue(null);
    const channels = this.messageForm
      .getRawValue()
      .messageChannels.filter((channel: { messageChannel: MessageChannelDTO; selected: boolean }) => channel.selected)
      .map((channel: { messageChannel: MessageChannelDTO; selected: boolean }) => channel.messageChannel.id);
    if (channels && channels.length) {
      const spinner = this.spinnerService.show();
      this.cardService
        .getMessageTemplates(this.cardInstance.cardInstanceWorkflow.id, channels)
        .pipe(take(1))
        .subscribe({
          next: (res) => {
            this.templateList = res;
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
    } else {
      this.templateList = [];
    }
  }
  public changeComunicationTemplate() {
    while ((this.messageForm.get('messageClients') as FormArray).length !== 0) {
      (this.messageForm.get('messageClients') as FormArray).removeAt(0);
    }
    const template = this.messageForm.get('comunicationTemplate').value;
    const channels = this.messageForm
      .getRawValue()
      .messageChannels.filter((channel: { messageChannel: MessageChannelDTO; selected: boolean }) => channel.selected)
      .map((channel: { messageChannel: MessageChannelDTO; selected: boolean }) => channel.messageChannel.id);
    if (template && channels && channels.length) {
      const spinner = this.spinnerService.show();
      this.cardService
        .getMessageClients(this.cardInstance.cardInstanceWorkflow.id, template, channels)
        .pipe(take(1))
        .subscribe({
          next: (res) => {
            res.forEach((message: CardMessageRenderDTO) => {
              (this.messageForm.get('messageClients') as FormArray).push(
                this.fb.group({
                  messageChannelId: [message.messageChannelId],
                  messageRender: [message.messageRender, [Validators.required]],
                  subjectRender: [message.subjectRender, message.messageChannelId === 2 ? [Validators.required] : []],
                  attachments: [message.attachments ? message.attachments : null]
                })
              );
            });
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
  public getTabLabel(item: FormGroup): string {
    return this.messageChannels.find((channel: MessageChannelDTO) => channel.id === item.value.messageChannelId).name + '*';
  }
  public confirmCloseCustomDialog(): Observable<boolean> {
    if (this.messageForm.touched && this.messageForm.dirty) {
      return this.confirmDialogService.open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('common.unsavedChangesExit'))
      });
    } else {
      return of(true);
    }
  }

  public onSubmitCustomDialog(): Observable<boolean> {
    const formValue = this.messageForm.getRawValue();
    const spinner = this.spinnerService.show();
    const template = this.messageForm.get('comunicationTemplate').value;

    if (this.remoteSignature?.id) {
      formValue.messageClients.map((m: CardMessageRenderDTO) => {
        m.cardInstanceRemoteSignatureId = this.remoteSignature.id;
        return m;
      });
    }

    const channels = this.messageForm
      .getRawValue()
      .messageChannels.filter((channel: { messageChannel: MessageChannelDTO; selected: boolean }) => channel.selected)
      .map((channel: { messageChannel: MessageChannelDTO; selected: boolean }) => {
        if (channel.messageChannel.id === 4) {
          formValue.messageClients = formValue.messageClients.map((client: CardMessageRenderDTO) => {
            if (client.messageChannelId === 4) {
              return {
                ...client,
                templateId: template
              };
            }
            return client;
          });
        }
        return channel.messageChannel.id;
      });

    if (template && channels && channels.length) {
      return this.cardService
        .sendMessageClients(this.cardInstance.cardInstanceWorkflow.id, channels, formValue.messageClients)
        .pipe(
          map((response) => {
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
    } else {
      return of(false);
    }
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
          disabledFn: () => !(this.messageForm && this.messageForm.touched && this.messageForm.dirty && this.messageForm.valid)
        }
      ]
    };
  }
  public convertToPlain(html: string) {
    const tempDivElement = document.createElement('div');
    tempDivElement.innerHTML = html;
    return tempDivElement.textContent || tempDivElement.innerText || '';
  }
  public textEditorContentChanged(html: string, form: FormControl, plain?: boolean) {
    if (html !== form.value) {
      if (plain) {
        html = this.convertToPlain(html);
      }
      if ((html === '' || this.convertToPlain(html) === '') && html.length < 20) {
        html = null;
      }
      form.setValue(html, { emitEvent: true });
    }
  }

  private initializeForm(): void {
    this.messageForm = this.fb.group({
      messageChannels: this.fb.array([]),
      comunicationTemplate: [null, [Validators.required]],
      messageClients: this.fb.array([], Validators.required)
    });
    this.messageChannels.forEach((channel: MessageChannelDTO) => {
      (this.messageForm.get('messageChannels') as FormArray).push(
        this.fb.group({
          messageChannel: [channel],
          selected: [
            !this.isContractedModule('customerArea') && !this.isContractedModule('whatsapp') && !this.isContractedModule('sms')
              ? [channel.id === 1, channel.id === 2]
              : [channel.id === 1]
          ]
        })
      );
    });
    this.selectMessageChannel();
  }
}
