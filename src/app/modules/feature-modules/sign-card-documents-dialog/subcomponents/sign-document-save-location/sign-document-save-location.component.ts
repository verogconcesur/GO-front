import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { CardAttachmentsDTO } from '@data/models/cards/card-attachments-dto';
import { SignDocumentExchangeDTO } from '@data/models/templates/templates-checklists-dto';
import { TemplatesChecklistsService } from '@data/services/templates-checklists.service';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { NGXLogger } from 'ngx-logger';
import { finalize, take } from 'rxjs/operators';
import { SignDocumentAuxService } from '../sign-document-checklist/sign-document-aux.service';

@Component({
  selector: 'app-sign-document-save-location',
  templateUrl: './sign-document-save-location.component.html',
  styleUrls: ['./sign-document-save-location.component.scss']
})
export class SignDocumentSaveLocationComponent implements OnInit {
  @Input() wCardId: number;
  @Input() pdf: SignDocumentExchangeDTO;
  public attachmentsByGroup: CardAttachmentsDTO[] = [];

  constructor(
    private fb: UntypedFormBuilder,
    private spinnerService: ProgressSpinnerDialogService,
    private confirmDialogService: ConfirmDialogService,
    private translateService: TranslateService,
    private globalMessageService: GlobalMessageService,
    private signDocumentAuxService: SignDocumentAuxService,
    private router: Router,
    private templatesChecklistsService: TemplatesChecklistsService,
    private logger: NGXLogger
  ) {}

  ngOnInit(): void {
    this.getAttachmentsDirectories();
  }

  private getAttachmentsDirectories(): void {
    const spinner = this.spinnerService.show();
    this.templatesChecklistsService
      .getAttachmentsChecklistByWCardId(this.wCardId)
      .pipe(
        take(1),
        finalize(() => this.spinnerService.hide(spinner))
      )
      .subscribe({
        next: (data) => {
          this.attachmentsByGroup = data;
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
}
