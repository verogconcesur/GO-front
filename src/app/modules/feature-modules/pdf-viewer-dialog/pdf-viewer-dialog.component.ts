import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { AttachmentDTO } from '@data/models/cards/card-attachments-dto';
import { TranslateService } from '@ngx-translate/core';
import saveAs from 'file-saver';

@Component({
  selector: 'app-pdf-viewer-dialog',
  templateUrl: './pdf-viewer-dialog.component.html',
  styleUrls: ['./pdf-viewer-dialog.component.scss']
})
export class PdfViewerDialogComponent implements OnInit {
  public title = '';
  public attachment: AttachmentDTO;
  public labels = {
    titlePdf: marker('pdf.viewer'),
    download: marker('common.download')
  };

  constructor(
    private dialogRef: MatDialogRef<PdfViewerDialogComponent>,
    private translateService: TranslateService,
    @Inject(MAT_DIALOG_DATA) public dialogData: AttachmentDTO
  ) {}

  ngOnInit(): void {
    if (this.dialogData) {
      this.attachment = this.dialogData;
      this.title = this.attachment.name ? this.attachment.name : this.translateService.instant(this.labels.titlePdf);
      console.log(this.attachment);
    }
  }

  public close(): void {
    this.dialogRef.close();
  }

  public download(): void {
    saveAs(`data:${this.attachment.type};base64,${this.attachment.content}`, this.attachment.name);
  }
}
