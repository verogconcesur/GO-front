import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { TranslateService } from '@ngx-translate/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { take } from 'rxjs/operators';
import TemplatesChecklistsDTO, { SignDocumentExchangeDTO } from '@data/models/templates/templates-checklists-dto';
import { AttachmentDTO } from '@data/models/cards/card-attachments-dto';

@Component({
  selector: 'app-sign-card-documents-dialog',
  templateUrl: './sign-card-documents-dialog.component.html',
  styleUrls: ['./sign-card-documents-dialog.component.scss']
})
export class SignCardDocumentsDialogComponent implements OnInit {
  public stepIndex = 0;
  public wCardId: number;
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
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const state: any = this.location.getState();
    if (state.relativeTo) {
      this.relativeTo = JSON.parse(state.relativeTo);
    }
    if (this.route?.snapshot?.params?.idCard) {
      this.wCardId = parseInt(this.route?.snapshot?.params?.idCard, 10);
    }
  }

  public getTitle(): string {
    switch (this.stepIndex) {
      case 0:
        return marker('common.actionsTabItems.sign');
      case 1:
        return marker('cards.eventType.ADD_DOC');
      case 2:
        return this.pdfName;
      case 3:
        return marker('common.saveFile');
    }
    return '';
  }

  public setPdfName(pdfname: string): void {
    this.pdfName = pdfname;
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
    console.log(pdf);
    this.pdf = pdf;
    this.stepIndex = 3;
  }

  public closeDialog(): void {
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

  private preparePdfStep(): void {
    this.stepIndex = 2;
  }
}
