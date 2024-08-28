import { Injectable } from '@angular/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { errorAttachmentDTO } from '@data/models/cards/card-attachments-dto';
import CardColumnTabItemDTO from '@data/models/cards/card-column-tab-item-dto';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WorkflowRequiredFieldsAuxService {
  private requiredFields$: BehaviorSubject<CardColumnTabItemDTO[]> = new BehaviorSubject(null);
  private requiredAttachments$: BehaviorSubject<errorAttachmentDTO[]> = new BehaviorSubject(null);
  constructor(private translateService: TranslateService) {}

  public resetRequiredFields(): void {
    this.requiredFields$.next(null);
  }

  public setRequiredFields(requiredFields: CardColumnTabItemDTO[]): void {
    this.requiredFields$.next(requiredFields);
  }

  public resetRequiredAttachments(): void {
    this.requiredAttachments$.next(null);
  }

  public setRequiredAttachments(requiredAttachments: errorAttachmentDTO[]): void {
    this.requiredAttachments$.next(requiredAttachments);
  }
  // Verifica si una columna es requerida ya sea por campos o adjuntos
  public isColRequired(id: number): boolean {
    const requiredFields = this.requiredFields$.getValue();
    const requiredAttachments = this.requiredAttachments$.getValue();
    const fieldFound = requiredFields?.some((item) => item.colId === id);
    const attachmentFound = requiredAttachments?.some((item) => item.tab.colId === id);
    return fieldFound || attachmentFound;
  }

  // Obtiene el tooltip para una columna, combinando información de campos y adjuntos
  public getColTooltip(id: number): string {
    const requiredFields = this.requiredFields$.getValue();
    const requiredAttachments = this.requiredAttachments$.getValue();

    let tooltip = '';

    if (requiredFields?.length) {
      const fields = requiredFields
        .filter((item) => item.colId === id)
        .map((f) => f.name)
        .join(', ');
      tooltip += this.translateService.instant(marker('common.fieldRequired')) + ': ' + fields;
    }

    if (requiredAttachments?.length) {
      const attachments = requiredAttachments
        .filter((item) => item.tab.colId === id)
        .map((f) => f.tab.name)
        .join(', ');
      if (tooltip) {
        tooltip += '\n';
      }
      tooltip += this.translateService.instant(marker('common.attachmentRequired')) + ': ' + attachments;
    }

    return tooltip;
  }

  // Verifica si una pestaña es requerida ya sea por campos o adjuntos
  public isTabRequired(colId: number, id: number): boolean {
    const requiredFields = this.requiredFields$.getValue();
    const requiredAttachments = this.requiredAttachments$.getValue();
    const fieldFound = requiredFields?.some((item) => item.colId === colId && item.tabId === id);
    const attachmentFound = requiredAttachments?.some((item) => item.tab.colId === colId && item.tab.id === id);
    return fieldFound || attachmentFound;
  }

  // Obtiene el tooltip para una pestaña, combinando información de campos y adjuntos
  public getTabTooltip(colId: number, id: number): string {
    const requiredFields = this.requiredFields$.getValue();
    const requiredAttachments = this.requiredAttachments$.getValue();

    let tooltip = '';

    if (requiredFields?.length) {
      tooltip +=
        this.translateService.instant(marker('common.fieldRequired')) + ': ' + this.getTabRequiredFieldsString(colId, id);
    }

    if (requiredAttachments?.length) {
      if (tooltip) {
        tooltip += '\n';
      }
      tooltip +=
        this.translateService.instant(marker('common.attachmentRequired')) +
        ': ' +
        this.getTabRequiredAttachmentsString(colId, id);
    }

    return tooltip;
  }

  // Obtiene la cadena de campos requeridos para una pestaña
  public getTabRequiredFieldsString(colId: number, id: number): string {
    const requiredFields = this.requiredFields$.getValue();
    if (requiredFields?.length) {
      const fields = requiredFields
        .filter((item) => item.colId === colId && item.tabId === id)
        .map((f) => f.name)
        .join(', ');
      return fields;
    }
    return '';
  }

  // Obtiene la cadena de adjuntos requeridos para una pestaña
  public getTabRequiredAttachmentsString(colId: number, id: number): string {
    const requiredAttachments = this.requiredAttachments$.getValue();
    if (requiredAttachments?.length) {
      const attachments = requiredAttachments
        .filter((item) => item.tab.colId === colId && item.tab.id === id)
        .map((f) => f.tab.name)
        .join(', ');
      return attachments;
    }
    return '';
  }

  // Verifica si un campo específico es requerido ya sea por campos o adjuntos
  public isFieldRequired(tabId: number, id: number): boolean {
    const requiredFields = this.requiredFields$.getValue();
    const requiredAttachments = this.requiredAttachments$.getValue();
    const fieldFound = requiredFields?.some((item) => item.tabId === tabId && item.id === id);
    const attachmentFound = requiredAttachments?.some((item) => item.tab.id === tabId && item.templateAttachmentItem.id === id);
    return fieldFound || attachmentFound;
  }
}
