import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { CardAttachmentsDTO } from '@data/models/cards/card-attachments-dto';
import { SignDocumentExchangeDTO } from '@data/models/templates/templates-checklists-dto';
import { TemplatesChecklistsService } from '@data/services/templates-checklists.service';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import FilenameValidator from '@shared/validators/filename.validator';
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
  @Output() saveComplete: EventEmitter<boolean> = new EventEmitter();
  public attachmentsByGroup: CardAttachmentsDTO[] = [];
  public pdfForm: UntypedFormGroup;
  public minLength = 3;

  public labels = {
    name: marker('common.fileName'),
    selectDirectory: marker('administration.templates.checklists.selectDirectory'),
    required: marker('errors.required'),
    errorFilenameName: marker('errors.fileNameCharacters'),
    errorFilenameExtension: marker('errors.fileNameExtension'),
    errorMaxLength: marker('errors.maxLengthError'),
    errorMinLength: marker('errors.minLength'),
    extensionChanged: marker('errors.extensionChanged'),
    save: marker('common.save')
  };
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
  public selectDirectory(directory: CardAttachmentsDTO): void {
    this.pdfForm.get('attachmentDirectory').setValue(directory);
  }
  public directorySelected(directory: CardAttachmentsDTO): boolean {
    return (
      directory &&
      this.pdfForm.get('attachmentDirectory').value &&
      directory.templateAttachmentItem.id === this.pdfForm.get('attachmentDirectory').value.templateAttachmentItem.id
    );
  }
  public save() {
    const spinner = this.spinnerService.show();
    const formData = this.pdfForm.getRawValue();
    this.pdf.procesedFile.name = formData.name;
    this.templatesChecklistsService
      .saveDocument(
        this.wCardId,
        formData.attachmentDirectory.tabId,
        formData.attachmentDirectory.templateAttachmentItem.id,
        this.pdf
      )
      .pipe(
        take(1),
        finalize(() => this.spinnerService.hide(spinner))
      )
      .subscribe({
        next: (data) => {
          this.saveComplete.emit();
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

  private initializeForm() {
    this.pdfForm = this.fb.group({
      name: [
        this.pdf.procesedFile.name,
        Validators.compose([Validators.required, Validators.minLength(this.minLength), FilenameValidator.validate('name')])
      ],
      attachmentDirectory: [
        this.attachmentsByGroup && this.attachmentsByGroup.length ? this.attachmentsByGroup[0] : null,
        [Validators.required]
      ]
    });
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
          this.initializeForm();
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
