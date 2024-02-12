import { Injectable } from '@angular/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CardColumnTabItemDTO from '@data/models/cards/card-column-tab-item-dto';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WorkflowRequiredFieldsAuxService {
  private requiredFields$: BehaviorSubject<CardColumnTabItemDTO[]> = new BehaviorSubject(null);
  constructor(private translateService: TranslateService) {}

  public resetRequiredFields(): void {
    this.requiredFields$.next(null);
  }

  public setRequiredFields(requiredFields: CardColumnTabItemDTO[]): void {
    this.requiredFields$.next(requiredFields);
  }

  public isColRequired(id: number): boolean {
    const requiredFields = this.requiredFields$.getValue();
    if (requiredFields?.length) {
      return requiredFields.find((item) => item.colId === id) ? true : false;
    }
    return false;
  }

  public getColTooltip(id: number): string {
    const requiredFields = this.requiredFields$.getValue();
    if (requiredFields?.length) {
      const fields = requiredFields
        .filter((item) => item.colId === id)
        .map((f) => f.name)
        .join(', ');
      return this.translateService.instant(marker('common.fieldRequired')) + ': ' + fields;
    }
    return '';
  }

  public isTabRequired(colId: number, id: number): boolean {
    const requiredFields = this.requiredFields$.getValue();
    if (requiredFields?.length) {
      return requiredFields.find((item) => item.colId === colId && item.tabId === id) ? true : false;
    }
    return false;
  }

  public getTabTooltip(colId: number, id: number): string {
    const requiredFields = this.requiredFields$.getValue();
    if (requiredFields?.length) {
      return this.translateService.instant(marker('common.fieldRequired')) + ': ' + this.getTabRequiredFieldsString(colId, id);
    }
    return '';
  }

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

  public isFieldRequired(tabId: number, id: number): boolean {
    const requiredFields = this.requiredFields$.getValue();
    if (requiredFields?.length) {
      return requiredFields.find((item) => item.tabId === tabId && item.id === id) ? true : false;
    }
    return false;
  }
}
