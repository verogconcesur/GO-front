import { Component, OnInit } from '@angular/core';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  FormArray,
  FormGroup,
  AbstractControl,
  Validators,
  FormControl
} from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CardInstanceDTO from '@data/models/cards/card-instance-dto';
import CardMessageRenderDTO from '@data/models/cards/card-message-render';
import MessageChannelDTO from '@data/models/templates/message-channels-dto';
import TemplatesCommonDTO from '@data/models/templates/templates-common-dto';
import { CardMessagesService } from '@data/services/card-messages.service';
import { TemplatesCommunicationService } from '@data/services/templates-communication.service';
import { ComponentToExtendForCustomDialog, CustomDialogFooterConfigI } from '@jenga/custom-dialog';
// eslint-disable-next-line max-len
import { TextEditorWrapperConfigI } from '@modules/feature-modules/text-editor-wrapper/interfaces/text-editor-wrapper-config.interface';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { Observable, of } from 'rxjs';
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
    subject: marker('administration.templates.communications.subject')
  };
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
    private globalMessageService: GlobalMessageService
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
  get messageChannelsForm() {
    return this.messageForm.get('messageChannels') as FormArray;
  }
  get messageClientsForm() {
    return this.messageForm.get('messageClients') as FormArray;
  }
  ngOnInit(): void {
    const spinner = this.spinnerService.show();
    this.cardInstance = this.extendedComponentData;
    this.communicationService
      .getMessageChannels()
      .pipe(take(1))
      .subscribe((res) => {
        this.messageChannels = res;
        this.initializeForm();
        this.spinnerService.hide(spinner);
      });
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
        .subscribe((res) => {
          this.templateList = res;
          this.spinnerService.hide(spinner);
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
        .subscribe((res) => {
          res.forEach((message: CardMessageRenderDTO) => {
            (this.messageForm.get('messageClients') as FormArray).push(
              this.fb.group({
                messageChannelId: [message.messageChannelId],
                messageRender: [message.messageRender, [Validators.required]],
                subjectRender: [message.subjectRender, message.messageChannelId === 2 ? [Validators.required] : []]
              })
            );
          });
          this.spinnerService.hide(spinner);
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
    const channels = this.messageForm
      .getRawValue()
      .messageChannels.filter((channel: { messageChannel: MessageChannelDTO; selected: boolean }) => channel.selected)
      .map((channel: { messageChannel: MessageChannelDTO; selected: boolean }) => channel.messageChannel.id);
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
      if (html === '' || html === ' ' || this.convertToPlain(html) === '' || this.convertToPlain(html) === ' ') {
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
          selected: [false]
        })
      );
    });
  }
}
