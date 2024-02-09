import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { TranslateService } from '@ngx-translate/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { finalize, take } from 'rxjs/operators';
import TemplatesChecklistsDTO, { SignDocumentExchangeDTO } from '@data/models/templates/templates-checklists-dto';
import { AttachmentDTO } from '@data/models/cards/card-attachments-dto';
import { CardAttachmentsService } from '@data/services/card-attachments.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import CardInstanceRemoteSignatureDTO from '@data/models/cards/card-instance-remote-signature-dto';

@Component({
  selector: 'app-sign-card-documents-dialog',
  templateUrl: './sign-card-documents-dialog.component.html',
  styleUrls: ['./sign-card-documents-dialog.component.scss']
})
export class SignCardDocumentsDialogComponent implements OnInit {
  public mode: 'REMOTE' | 'NO_REMOTE';
  public stepIndex = 0;
  public wCardId: number;
  public wCardUserId: number;
  public template: TemplatesChecklistsDTO;
  public pdf: SignDocumentExchangeDTO;
  public pdfName: string;
  public labels = {
    noDataToShow: marker('errors.noDataToShow')
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private relativeTo: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private spinnerService: ProgressSpinnerDialogService,
    private confirmDialogService: ConfirmDialogService,
    private cardAttachmentService: CardAttachmentsService,
    private translateService: TranslateService,
    private globalMessageService: GlobalMessageService
  ) {}

  ngOnInit(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const state: any = this.location.getState();
    if (state.relativeTo) {
      this.relativeTo = JSON.parse(state.relativeTo);
    }
    if (this.route?.snapshot?.params?.idCard) {
      this.wCardId = parseInt(this.route?.snapshot?.params?.idCard, 10);
      this.wCardUserId = parseInt(this.route?.snapshot?.params?.idUser, 10);
    }
  }

  public getTitle(): string {
    switch (this.stepIndex) {
      case 0:
        return marker('common.actionsTabItems.sign');
      case 1:
        return marker('cards.eventType.ADD_DOC');
      case 2:
        if (this.mode === 'REMOTE') {
          return `${this.pdfName ? this.pdfName : ' '} - ${this.translateService.instant(
            marker('administration.templates.checklists.remoteChecklistPreviewer')
          )}`;
        } else {
          return `${this.pdfName ? this.pdfName : ' '} - ${this.translateService.instant(
            marker('administration.templates.checklists.noRemoteChecklistPreviewer')
          )}`;
        }
      case 3:
        return marker('common.saveFile');
    }
    return '';
  }

  public isSmallModal(): boolean {
    if (this.mode === 'NO_REMOTE') {
      return this.stepIndex !== 2;
    } else {
      return this.stepIndex !== 2;
    }
  }

  public setPdfName(pdfname: string): void {
    this.pdfName = pdfname;
  }

  public modeSelected(mode: 'REMOTE' | 'NO_REMOTE'): void {
    this.mode = mode;
  }

  public templateSelected(template: TemplatesChecklistsDTO): void {
    this.template = template;
    if (this.template.includeFile) {
      this.pdf = {
        attachment: null,
        procesedFile: null,
        signDocumentMode: 'TEMPLATE',
        tabId: null,
        templateChecklist: this.template,
        upload: null
      };
      this.preparePdfStep();
    } else {
      this.stepIndex = 1;
    }
  }

  public fileSelected(event: { file: AttachmentDTO; tabId: number }): void {
    // console.log('fileSelected', event);
    if (event.file.id) {
      this.pdf = {
        attachment: event.file,
        procesedFile: null,
        signDocumentMode: 'ATTACHMENT',
        tabId: event.tabId,
        templateChecklist: this.template,
        upload: null
      };
    } else {
      this.pdf = {
        attachment: null,
        procesedFile: null,
        signDocumentMode: 'UPLOAD',
        tabId: null,
        templateChecklist: this.template,
        upload: event.file
      };
    }
    this.preparePdfStep();
  }

  public pdfSignedEvent(pdf: SignDocumentExchangeDTO): void {
    if (this.mode === 'REMOTE') {
      const spinner = this.spinnerService.show();
      let fileId = null;
      if (this.template.includeFile) {
        fileId = null;
      } else if (this.pdf?.attachment?.id) {
        fileId = this.pdf.attachment.id;
      } else if (this.pdf?.procesedFile?.id) {
        fileId = this.pdf.procesedFile.id;
      } else if (this.pdf?.upload?.id) {
        fileId = this.pdf.upload.id;
      }

      this.cardAttachmentService
        .sendRemoteSignature(this.wCardId, this.template.id, fileId)
        .pipe(
          take(1),
          finalize(() => this.spinnerService.hide(spinner))
        )
        .subscribe({
          next: (data: CardInstanceRemoteSignatureDTO) => {
            this.globalMessageService.showSuccess({
              message: this.translateService.instant(marker('administration.templates.checklists.remoteSignatureSendSuccess')),
              actionText: this.translateService.instant(marker('common.close'))
            });
            this.closeDialog(true, data);
          },
          error: (error) => {
            this.globalMessageService.showError({
              message: error.message,
              actionText: this.translateService.instant(marker('common.close'))
            });
          }
        });
    } else {
      this.pdf = pdf;
      this.stepIndex = 3;
    }
  }

  public closeDialog(autoExit?: boolean, cardRemoteSignature?: CardInstanceRemoteSignatureDTO): void {
    if (autoExit) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // const state: any = this.location.getState();
      // if (state?.navigationId !== 1) {
      //   this.location.back();
      // } else {
      //   this.router.navigateByUrl(
      //     `${this.router.url.split(RouteConstants.WORKFLOWS_CARD_SIGN + '/')[0]}(card:wcId/${this.wCardId}/wuId/${
      //       this.wCardUserId
      //     })`
      //   );
      // }
      if (this.relativeTo) {
        this.router.navigate([{ outlets: { card: null } }], {
          relativeTo: this.relativeTo
        });
      } else {
        const currentUrl = window.location.hash.split('#/').join('/').split('/(cardSign:')[0] + ')';
        this.router.navigateByUrl(currentUrl);
      }
    } else {
      this.confirmDialogService
        .open({
          title: this.translateService.instant(marker('common.warning')),
          message: `${this.translateService.instant(marker('errors.ifContinueLosingChanges'))}. ${this.translateService.instant(
            marker('common.askForConfirmation')
          )}`
        })
        .pipe(take(1))
        .subscribe((ok: boolean) => {
          if (ok) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            // const state: any = this.location.getState();
            // if (state?.navigationId !== 1) {
            //   this.location.back();
            // } else {
            //   this.router.navigateByUrl(
            //     `${this.router.url.split(RouteConstants.WORKFLOWS_CARD_SIGN + '/')[0]}(card:wcId/${this.wCardId}/wuId/${
            //       this.wCardUserId
            //     })`
            //   );
            // }
            if (this.relativeTo) {
              this.router.navigate([{ outlets: { card: null } }], {
                relativeTo: this.relativeTo
              });
            } else {
              const currentUrl = window.location.hash.split('#/').join('/').split('/(cardSign:')[0] + ')';
              this.router.navigateByUrl(currentUrl);
            }
          }
        });
    }
    if (cardRemoteSignature) {
      this.cardAttachmentService.remoteSignatureSubject$.next(cardRemoteSignature);
    }
  }

  private preparePdfStep(): void {
    this.stepIndex = 2;
  }
}
