import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, UntypedFormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { ModulesConstants } from '@app/constants/modules.constants';
import { AuthenticationService } from '@app/security/authentication.service';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { AttachmentDTO, CardAttachmentsDTO, CardWhatsapptAttachmentDTO } from '@data/models/cards/card-attachments-dto';
import CardInstanceWhatsappDTO from '@data/models/cards/card-instance-whatsapp-dto';
import CardMessageDTO from '@data/models/cards/card-message';
import { CardAttachmentsService } from '@data/services/card-attachments.service';
import { CardMessagesService } from '@data/services/card-messages.service';
import { TranslateService } from '@ngx-translate/core';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { NGXLogger } from 'ngx-logger';
import { finalize, forkJoin, take } from 'rxjs';
import CardInstanceAttachmentsConfig, {
  CardInstanceAttachmentsModalVersionConfig
} from '../card-instance-attachments/card-instance-attachments-config-interface';
import {
  CardInstanceAttachmentsComponent,
  CardInstanceAttachmentsComponentEnum
} from '../card-instance-attachments/card-instance-attachments.component';
import { MediaViewerService } from '../media-viewer-dialog/media-viewer.service';
@Component({
  selector: 'app-modal-chat-whatsapp',
  templateUrl: './modal-chat-whatsapp.component.html',
  styleUrls: ['./modal-chat-whatsapp.component.scss']
})
export class ModalChatWhatsappComponent implements OnInit, OnDestroy {
  public labels = {
    title: marker('startConv.title'),
    template: marker('startConv.template'),
    phone: marker('startConv.phone'),
    message: marker('startConv.message'),
    required: marker('errors.required')
  };
  public cardInstanceAttachmentsConfig: CardInstanceAttachmentsConfig;
  public attachmentList: CardAttachmentsDTO[] = [];
  public chatForm: FormGroup;
  public cardInstanceWorkflowId: number;
  public initialMessage: CardMessageDTO;
  public messageList: CardInstanceWhatsappDTO[] = [];
  public active = false;
  public recording = false;
  public modalTitle = '';
  public mediaRecorder: MediaRecorder;
  public chunks: BlobPart[] = [];
  public barList = Array(20).fill(0);
  public interval: NodeJS.Timeout;

  constructor(
    private fb: UntypedFormBuilder,
    private spinnerService: ProgressSpinnerDialogService,
    private translateService: TranslateService,
    private globalMessageService: GlobalMessageService,
    private cardMessagesService: CardMessagesService,
    private cardAttachmentsService: CardAttachmentsService,
    public dialogRef: MatDialogRef<ModalChatWhatsappComponent>,
    public dialog: MatDialog,
    private logger: NGXLogger,
    private datePipe: DatePipe,
    private mediaService: MediaViewerService,
    private attachmentService: CardAttachmentsService,
    private authService: AuthenticationService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      message: CardMessageDTO;
      cardInstanceWorkflowId: number;
    },
    private domSanitizer: DomSanitizer,
    private cd: ChangeDetectorRef
  ) {}

  // Convenience getter for easy access to form fields
  get form() {
    return this.chatForm.controls;
  }

  ngOnDestroy(): void {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
  ngOnInit(): void {
    const spinner = this.spinnerService.show();
    this.cardInstanceWorkflowId = this.data.cardInstanceWorkflowId;
    this.initialMessage = this.data.message;
    this.initializeForm();
    const resquests = [
      this.cardMessagesService.checkWhatsappConversationActive(this.cardInstanceWorkflowId).pipe(take(1)),
      this.cardMessagesService.getWhatsappConversationMessages(this.cardInstanceWorkflowId, this.initialMessage.id).pipe(take(1)),
      this.cardAttachmentsService.getCardAttachmentsByInstance(this.cardInstanceWorkflowId).pipe(take(1))
    ];
    forkJoin(resquests).subscribe(
      (responses: [CardInstanceWhatsappDTO, CardInstanceWhatsappDTO[], CardAttachmentsDTO[]]) => {
        if (responses[0] && this.initialMessage.id === responses[0].cardInstanceMessage.id) {
          this.active = true;
        }
        this.messageList = responses[1]
          ? responses[1].filter((message) => message.body || (message.attachments && message.attachments.length))
          : [];
        this.attachmentList = responses[2] ? responses[2] : [];
        this.cardInstanceAttachmentsConfig = {
          tabId: null,
          wcId: this.cardInstanceWorkflowId,
          permission: 'SHOW',
          disableAttachmentsSelection: false,
          disableLandingAction: true,
          disableEditFileName: true,
          disableIndividualDeleteAction: true,
          disableIndividualDownloadAction: true,
          disableAttachmentsAddition: true
        };
        this.getModalTitle();
        if (this.active) {
          this.interval = setInterval(() => {
            this.reloadData();
          }, 10000);
        }
        this.spinnerService.hide(spinner);
      },
      (errors) => {
        this.spinnerService.hide(spinner);
        this.logger.error(errors);
        this.globalMessageService.showError({
          message: errors.message,
          actionText: this.translateService.instant(marker('common.close'))
        });
      }
    );
  }

  public isWhatsappContractedModule(): boolean {
    const configList = this.authService.getConfigList();
    return configList.includes(ModulesConstants.WHATSAPP_SEND);
  }

  public close() {
    this.dialogRef.close();
  }
  public getModalTitle() {
    if (this.messageList && this.messageList.length) {
      if (this.messageList.find((mW) => mW.direction === 'outbound-api')) {
        this.modalTitle = this.messageList.find((mW) => mW.direction === 'outbound-api').to;
      } else if (this.messageList.find((mW) => mW.direction === 'inbound')) {
        this.modalTitle = this.messageList.find((mW) => mW.direction === 'inbound').from;
      } else {
        this.modalTitle = '';
      }
    } else {
      this.modalTitle = '';
    }
  }
  public sendAttachments() {
    const data: CardInstanceAttachmentsModalVersionConfig = {
      cardInstanceAttachmentsConfig: this.cardInstanceAttachmentsConfig,
      data: this.attachmentList,
      selected: this.form.attachments.value ? this.form.attachments.value : [],
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
        this.form.attachments.setValue(resp);
        this.createMessage();
      });
  }
  public startRecording() {
    const mediaConstraints: MediaStreamConstraints = {
      video: false,
      audio: true
    };
    navigator.mediaDevices.getUserMedia(mediaConstraints).then((stream) => {
      console.log(stream);
      const options = { mimeType: 'audio/ogg;codecs=opus' };
      if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
        options.mimeType = 'audio/ogg;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        options.mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/wave;codecs=opus')) {
        options.mimeType = 'audio/wave;codecs=opus';
      }
      this.mediaRecorder = new MediaRecorder(stream, options);
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: options.mimeType });
        this.chunks = [];
        const audioURL = URL.createObjectURL(blob);
        this.form.audio.setValue({
          urlSrc: this.domSanitizer.bypassSecurityTrustUrl(audioURL),
          data: blob,
          type: options.mimeType
        });
        this.cd.detectChanges();
      };
      this.mediaRecorder.ondataavailable = (e: { data: BlobPart }) => {
        this.chunks.push(e.data);
      };
      this.mediaRecorder.start();
      this.recording = true;
      this.cd.detectChanges();
    });
  }
  public pauseRecording() {
    this.recording = false;
    this.mediaRecorder.stop();
    this.cd.detectChanges();
  }
  public deleteRecording() {
    this.form.audio.setValue(null);
    this.cd.detectChanges();
  }
  public createMessage() {
    const formData = this.chatForm.getRawValue();
    const body: CardInstanceWhatsappDTO = { body: '', attachments: [] };
    if (formData.attachments && formData.attachments.length) {
      body.attachments = formData.attachments.map((att: AttachmentDTO) => {
        const attachWhats: CardWhatsapptAttachmentDTO = {
          file: att
        };
        return attachWhats;
      });
      this.postMessage(body);
    } else if (formData.audio) {
      const audio: AttachmentDTO = {
        content: '',
        name: 'audio.opus',
        type: formData.audio.type,
        size: formData.audio.data.size
      };
      const reader = new FileReader();
      reader.readAsDataURL(formData.audio.data);
      reader.onloadend = () => {
        audio.content = (reader.result as string).split('data:' + formData.audio.type + ';base64,')[1];
        body.attachments.push({ file: audio });
        this.postMessage(body);
      };
    } else if (formData.text) {
      body.body = formData.text;
      this.postMessage(body);
    }
  }
  public postMessage(body: CardInstanceWhatsappDTO) {
    const spinner = this.spinnerService.show();
    this.cardMessagesService
      .sendWhatsappConversation(body, this.cardInstanceWorkflowId, this.initialMessage.id)
      .pipe(
        take(1),
        finalize(() => this.spinnerService.hide(spinner))
      )
      .subscribe({
        next: () => {
          this.initializeForm();
          this.reloadData();
        },
        error: (error) => {
          this.logger.error(error);
          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
        }
      });
  }
  public reloadData() {
    this.cardMessagesService
      .getWhatsappConversationMessages(this.cardInstanceWorkflowId, this.initialMessage.id)
      .pipe(take(1))
      .subscribe({
        next: (data: CardInstanceWhatsappDTO[]) => {
          data = data.map((msg: CardInstanceWhatsappDTO) => {
            const message = this.messageList.find((msgAux: CardInstanceWhatsappDTO) => msgAux.id === msg.id);
            if (message) {
              msg.attachments = message.attachments;
            }
            return msg;
          });
          this.messageList = data.filter((message) => message.body || (message.attachments && message.attachments.length));
        },
        error: (error) => {
          this.logger.error(error);
          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
        }
      });
  }
  public getStatusIcon(message: CardInstanceWhatsappDTO): string {
    switch (message.status) {
      case 'failed':
        return 'clear';
      case 'canceled':
        return 'clear';
      case 'undelivered':
        return 'clear';
      case 'accepted':
        return 'done_all';
      case 'delivered':
        return 'done_all';
      case 'read':
        return 'done_all';
      case 'received':
        return 'done_all';
      default:
        return 'query_builder';
    }
  }
  public getDateMessage(message: CardInstanceWhatsappDTO): string {
    return message.dateCreated ? this.datePipe.transform(new Date(message.dateCreated), 'dd-MM-yyyy, HH:mm') : '';
  }
  public downloadAttachment(attachment: CardWhatsapptAttachmentDTO) {
    const spinner = this.spinnerService.show();
    this.attachmentService
      .downloadAttachmentByCardInstance(this.cardInstanceWorkflowId, attachment.file.id)
      .pipe(
        take(1),
        finalize(() => this.spinnerService.hide(spinner))
      )
      .subscribe({
        next: (data: AttachmentDTO) => {
          attachment.file = data;
        },
        error: (error) => {
          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
        }
      });
  }
  public showAttachment(attachment: CardWhatsapptAttachmentDTO) {
    if (attachment?.file?.content) {
      this.mediaService.openMediaViewer(attachment.file);
    }
  }
  public attachIsAudio(attachment: AttachmentDTO): boolean {
    if (
      attachment.type &&
      (attachment.type.indexOf('audio') >= 0 || attachment.type.indexOf('mp3') >= 0 || attachment.type.indexOf('ogg') >= 0)
    ) {
      return true;
    } else {
      return false;
    }
  }
  public getDataBase64(attachment: AttachmentDTO): string {
    return `data:${attachment.type};base64,${attachment.content}`;
  }
  public getAttachIcon(attachment: AttachmentDTO): string {
    if (attachment.type) {
      if (attachment.type.indexOf('pdf') >= 0) {
        return `url(/assets/img/pdf.png)`;
      } else if (attachment.type.indexOf('audio') >= 0 || attachment.type.indexOf('mp3') >= 0) {
        return `url(/assets/img/audio-file.png)`;
      } else if (attachment.type.indexOf('video') >= 0) {
        return `url(/assets/img/video-file.png)`;
      } else if (attachment.type.indexOf('image') >= 0) {
        return `url(/assets/img/image-file.png)`;
      }
    }
    return `url(/assets/img/unknown.svg)`;
  }
  private initializeForm = (): void => {
    this.chatForm = this.fb.group({
      text: [''],
      attachments: [[]],
      audio: ['']
    });
  };
}
