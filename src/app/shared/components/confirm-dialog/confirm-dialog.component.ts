import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

export interface ConfirmDialogConfig {
  title: string;
  message: string;
  yesActionText?: string;
  noActionText?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent implements OnInit {
  title: string;
  message: string;
  yesActionText: string;
  noActionText: string;

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    private translateService: TranslateService,
    @Inject(MAT_DIALOG_DATA) public config: ConfirmDialogConfig
  ) {}

  async ngOnInit() {
    this.title = this.config.title;
    this.message = this.config.message;

    this.yesActionText = await this.getTranslationStr(
      this.config.yesActionText,
      marker('confirmdialog.yes')
    );

    this.noActionText = await this.getTranslationStr(
      this.config.noActionText,
      marker('confirmdialog.no')
    );
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onDismiss(): void {
    this.dialogRef.close(false);
  }

  private async getTranslationStr(
    value: string,
    defaultValue: string
  ): Promise<string> {
    return value
      ? of(value).toPromise()
      : this.translateService.get(defaultValue).toPromise();
  }
}
