import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { AttachmentDTO } from '@data/models/cards/card-attachments-dto';
import { CardAttachmentsService } from '@data/services/card-attachments.service';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import FilenameValidator from '@shared/validators/filename.validator';
import { NGXLogger } from 'ngx-logger';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-rename-attachment',
  templateUrl: './rename-attachment.component.html',
  styleUrls: ['./rename-attachment.component.scss']
})
export class RenameAttachmentComponent implements OnInit {
  public labels = {
    title: marker('administration.templates.attachments.renameTitle'),
    save: marker('common.save'),
    required: marker('errors.required'),
    name: marker('common.fileName'),
    askForConfirmation: marker('common.askForConfirmation'),
    errorFilenameName: marker('errors.fileNameCharacters'),
    errorFilenameExtension: marker('errors.fileNameExtension'),
    errorMaxLength: marker('errors.maxLengthError'),
    errorMinLength: marker('errors.minLength'),
    extensionChanged: marker('errors.extensionChanged'),
    close: marker('common.close')
  };
  public maxLength = 80;
  public minLength = 3;
  public attachmentForm: UntypedFormGroup;
  public attachment: AttachmentDTO = null;
  public extension: string;
  public originalName: string;
  public tabId: number;
  public cardInstanceWorkflowId: number;
  public templateAttachmentItemId: number;

  constructor(
    public dialogRef: MatDialogRef<RenameAttachmentComponent>,
    private logger: NGXLogger,
    private translateService: TranslateService,
    private globalMessageService: GlobalMessageService,
    private confirmationDialog: ConfirmDialogService,
    private attachmentService: CardAttachmentsService,
    private spinnerService: ProgressSpinnerDialogService,
    @Inject(MAT_DIALOG_DATA)
    public data: { attachment: AttachmentDTO; cardInstanceWorkflowId: number; tabId: number; templateAttachmentItemId: number },
    private fb: FormBuilder
  ) {}

  get form() {
    return this.attachmentForm.controls;
  }

  ngOnInit(): void {
    this.attachment = this.data.attachment;
    this.tabId = this.data.tabId;
    this.cardInstanceWorkflowId = this.data.cardInstanceWorkflowId;
    this.templateAttachmentItemId = this.data.templateAttachmentItemId;
    this.extension = this.attachment.name.split('.')[1];
    this.originalName = this.attachment.name;
    this.initForm();
  }

  public save(): void {
    if (this.extension !== this.form.name.value.trim().split('.')[1]) {
      this.confirmationDialog
        .open({
          title: this.translateService.instant(marker('common.warning')),
          message: `${this.translateService.instant(this.labels.extensionChanged)} ${this.translateService.instant(
            this.labels.askForConfirmation
          )}`
        })
        .pipe(take(1))
        .subscribe((ok: boolean) => {
          if (ok) {
            this.setAttachmentName();
          }
        });
    } else {
      this.setAttachmentName();
    }
  }

  public close(): void {
    this.dialogRef.close();
  }

  private setAttachmentName() {
    const spinner = this.spinnerService.show();
    this.attachmentService
      .editAttachment(
        this.cardInstanceWorkflowId,
        this.tabId,
        this.attachment.id,
        this.form.name.value,
        this.templateAttachmentItemId
      )
      .pipe(take(1))
      .subscribe(
        (data) => {
          this.spinnerService.hide(spinner);
          this.dialogRef.close(true);
        },
        (error: ConcenetError) => {
          this.spinnerService.hide(spinner);
          this.logger.error(error);
          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
        }
      );
  }

  private initForm(): void {
    this.attachmentForm = this.fb.group({
      id: [this.attachment ? this.attachment.id : null],
      name: [
        this.attachment ? this.attachment.name : '',
        Validators.compose([
          Validators.required,
          Validators.maxLength(20),
          Validators.minLength(3),
          FilenameValidator.validate('name')
        ])
      ]
    });
  }
}
