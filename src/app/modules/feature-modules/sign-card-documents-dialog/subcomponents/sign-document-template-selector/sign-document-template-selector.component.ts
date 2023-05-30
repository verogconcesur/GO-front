import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import TemplatesChecklistsDTO, { TemplateChecklistItemDTO } from '@data/models/templates/templates-checklists-dto';
import { TemplatesChecklistsService } from '@data/services/templates-checklists.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { Observable } from 'rxjs';
import { finalize, take, tap } from 'rxjs/operators';

@Component({
  selector: 'app-sign-document-template-selector',
  templateUrl: './sign-document-template-selector.component.html',
  styleUrls: ['./sign-document-template-selector.component.scss']
})
export class SignDocumentTemplateSelectorComponent implements OnInit {
  @Input() wCardId: number;
  @Input() mode: 'REMOTE' | 'NO_REMOTE';
  @Output() templateSelected: EventEmitter<TemplatesChecklistsDTO> = new EventEmitter();
  public templates$: Observable<TemplatesChecklistsDTO[]>;
  public hasTemplates: boolean;
  public labels = {
    whichDocument: marker('administration.templates.checklists.whichDocument')
  };

  constructor(
    private templatesChecklistsService: TemplatesChecklistsService,
    private spinnerService: ProgressSpinnerDialogService
  ) {}

  ngOnInit(): void {
    this.getTemplates();
  }

  public selectTemplate(template: TemplatesChecklistsDTO): void {
    this.templateSelected.emit(template);
  }

  private getTemplates(): void {
    const spinner = this.spinnerService.show();
    //TODO DGDC: mandar mode como parámetro
    this.templates$ = this.templatesChecklistsService.getTemplatesChecklistByWCardId(this.wCardId, this.mode).pipe(
      take(1),
      tap((data: TemplatesChecklistsDTO[]) => (this.hasTemplates = data && data.length > 0 ? true : false)),
      finalize(() => this.spinnerService.hide(spinner))
    );
  }
}
