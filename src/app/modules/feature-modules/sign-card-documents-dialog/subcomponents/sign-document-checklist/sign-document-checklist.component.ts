import { Component, Input, OnInit } from '@angular/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { SignDocumentExchangeDTO } from '@data/models/templates/templates-checklists-dto';
import { TemplatesChecklistsService } from '@data/services/templates-checklists.service';
import { TranslateService } from '@ngx-translate/core';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { NGXLogger } from 'ngx-logger';
import { finalize, take } from 'rxjs/operators';

@Component({
  selector: 'app-sign-document-checklist',
  templateUrl: './sign-document-checklist.component.html',
  styleUrls: ['./sign-document-checklist.component.scss']
})
export class SignDocumentChecklistComponent implements OnInit {
  @Input() wCardId: number;
  @Input() pdf: SignDocumentExchangeDTO;
  public signDocumentExchange: SignDocumentExchangeDTO;

  constructor(
    private templatesChecklistsService: TemplatesChecklistsService,
    private spinnerService: ProgressSpinnerDialogService,
    private translateService: TranslateService,
    private logger: NGXLogger,
    private globalMessageService: GlobalMessageService
  ) {}

  ngOnInit(): void {
    this.preparePdf();
  }

  private preparePdf(): void {
    const spinner = this.spinnerService.show();
    this.templatesChecklistsService
      .signDocument(this.wCardId, this.pdf)
      .pipe(
        take(1),
        finalize(() => this.spinnerService.hide(spinner))
      )
      .subscribe({
        next: (data) => {
          this.signDocumentExchange = data;
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
