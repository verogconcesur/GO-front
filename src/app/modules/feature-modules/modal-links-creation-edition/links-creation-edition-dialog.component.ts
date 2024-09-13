import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import VariablesDTO from '@data/models/variables-dto';
// eslint-disable-next-line max-len
import { TextEditorWrapperConfigI } from '@modules/feature-modules/text-editor-wrapper/interfaces/text-editor-wrapper-config.interface';
import { TranslateService } from '@ngx-translate/core';
import { CustomDialogFooterConfigI } from '@shared/modules/custom-dialog/interfaces/custom-dialog-footer-config';
import { ComponentToExtendForCustomDialog } from '@shared/modules/custom-dialog/models/component-for-custom-dialog';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { Observable, of, tap } from 'rxjs';

export const enum LinksCreationEditionDialogComponentModalEnum {
  ID = 'links-creation-edition-dialog-id',
  PANEL_CLASS = 'links-creation-edition-dialog',
  TITLE = 'cards.column.links-dialog.title'
}

@Component({
  selector: 'app-links-creation-edition-dialog',
  templateUrl: './links-creation-edition-dialog.component.html',
  styleUrls: ['./links-creation-edition-dialog.component.scss']
})
export class LinksCreationEditionDialogComponent extends ComponentToExtendForCustomDialog implements OnInit {
  public listVariables: VariablesDTO[];
  public type: 'LINK' | 'EVENT' = 'LINK';
  public form: UntypedFormGroup;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public originalFormValue: any;
  public textEditorToolbarOnlyMacroOptions: TextEditorWrapperConfigI = {
    onlyMacroOption: true,
    addMacroListOption: true,
    macroListOptions: [],
    width: 670
  };
  public showBodyEditor = true;
  public bodyValidation: { valid: boolean; suggestion: string } = null;
  public labels = {
    title: marker('cards.column.links-dialog.title'),
    blockerTitle: marker('cards.column.links-dialog.blockerTitle'),
    evetnTitle: marker('cards.column.links-dialog.eventTitle'),
    webService: marker('cards.column.links-dialog.webService'),
    blocker: marker('cards.column.links-dialog.blocker'),
    color: marker('cards.column.links-dialog.color'),
    linkType: marker('cards.column.links-dialog.linkType'),
    linkPostBody: marker('cards.column.links-dialog.linkPostBody'),
    authLink: marker('cards.column.links-dialog.authLink'),
    requireAuth: marker('cards.column.links-dialog.requireAuth'),
    jsonError: marker('cards.column.links-dialog.jsonFormatError'),
    jsonSuggestionApply: marker('cards.column.links-dialog.jsonSuggestionApply'),
    authUrl: marker('cards.column.links-dialog.authUrl'),
    authUser: marker('cards.column.links-dialog.authUser'),
    authPass: marker('cards.column.links-dialog.authPass'),
    authAttributeToken: marker('cards.column.links-dialog.authAttributeToken'),
    redirect: marker('cards.column.links-dialog.redirect'),
    link: marker('cards.column.links-dialog.link'),
    name: marker('common.name'),
    nameColumn: marker('cards.column.columnName'),
    nameRequired: marker('userProfile.nameRequired'),
    actionConfiguration: marker('cards.column.actionConfiguration'),
    shortcutConfiguration: marker('cards.column.shortcutConfiguration'),
    nameLink: marker('cards.column.linkName'),
    newLink: marker('cards.column.newLink')
  };
  constructor(private confirmDialogService: ConfirmDialogService, private translateService: TranslateService) {
    super(
      LinksCreationEditionDialogComponentModalEnum.ID,
      LinksCreationEditionDialogComponentModalEnum.PANEL_CLASS,
      marker(LinksCreationEditionDialogComponentModalEnum.TITLE)
    );
  }

  ngOnInit(): void {
    this.type = this.extendedComponentData.type ? this.extendedComponentData.type : 'LINK';
    if (this.type === 'EVENT') {
      this.MODAL_TITLE = this.labels.evetnTitle;
    }
    this.form = this.extendedComponentData.form;
    this.originalFormValue = this.form.value;
    this.listVariables = this.extendedComponentData.listVariables;
    // console.log(this.form.value);
    this.textEditorToolbarOnlyMacroOptions.macroListOptions = this.listVariables.map((item: VariablesDTO) => item.name);
  }

  public confirmCloseCustomDialog(): Observable<boolean> {
    if (this.form.touched && this.form.dirty) {
      return this.confirmDialogService
        .open({
          title: this.translateService.instant(marker('common.warning')),
          message: this.translateService.instant(marker('common.unsavedChangesExit'))
        })
        .pipe(
          tap((result) => {
            if (result) {
              this.form.patchValue(this.originalFormValue);
            }
          })
        );
    } else {
      return of(true);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public onSubmitCustomDialog(): Observable<any> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return of(this.form.value as any);
  }

  public setAndGetFooterConfig(): CustomDialogFooterConfigI | null {
    return {
      show: true,
      leftSideButtons: [
        {
          type: 'close',
          label: marker('common.cancel'),
          design: 'flat'
        }
      ],
      rightSideButtons: [
        {
          type: 'submit',
          label: marker('common.confirm'),
          design: 'raised',
          color: 'primary',
          disabledFn: () =>
            !(this.form.touched && this.form.dirty && this.form.valid && (!this.bodyValidation || this.bodyValidation.valid))
        }
      ]
    };
  }

  public textEditorContentChanged(html: string, field: string, plain?: boolean) {
    const form = this.type === 'LINK' ? this.form.get('tabItemConfigLink') : this.form;
    if (html !== form.get(field).value) {
      if (plain) {
        html = this.convertToPlain(html);
      }
      if ((html === '' || this.convertToPlain(html) === '') && html.length < 20) {
        html = null;
      }
      if (field === 'body') {
        this.bodyValidation = this.validateAndSuggestJSON(html);
        if (!this.bodyValidation.valid && this.bodyValidation.suggestion) {
          html = this.bodyValidation.suggestion;
        }
      }
      if (this.form) {
        form.get(field).setValue(html, { emitEvent: true });
      }
      this.setVariablesFromTexts();
    }
  }

  public convertToPlain(html: string) {
    const tempDivElement = document.createElement('div');
    tempDivElement.innerHTML = html;
    return tempDivElement.textContent || tempDivElement.innerText || '';
  }

  public applyBodySuggestion(): void {
    this.showBodyEditor = false;
    const form = this.type === 'LINK' ? this.form.get('tabItemConfigLink') : this.form;
    form.get('body').setValue(this.bodyValidation.suggestion);
    this.bodyValidation = null;
    setTimeout(() => {
      this.showBodyEditor = true;
    }, 100);
  }

  public validateAndSuggestJSON(inputString: string): { valid: boolean; suggestion: string } {
    const result: { valid: boolean; suggestion: string } = {
      valid: false,
      suggestion: ''
    };
    try {
      JSON.parse(inputString);
      result.valid = true;
      return result;
    } catch (error) {
      // Identificar posibles errores comunes
      let suggestion = inputString;

      // Corregir comillas simples por comillas dobles
      suggestion = suggestion.replace(/'/g, '"');

      // Corregir comas finales
      suggestion = suggestion.replace(/,\s*([}\]])/g, '$1');

      // Asegurarse de que hay comas entre los pares de clave-valor
      suggestion = suggestion.replace(/}\s*{/g, '},{');
      suggestion = suggestion.replace(/}\s*"([^"]+)":/g, '},{"$1":');

      // Reemplazar punto y coma por comas
      suggestion = suggestion.replace(/([}\]"\d\w\s]);(\s*[{["\d\w])/g, '$1,$2');

      // Eliminar espacios innecesarios
      suggestion = suggestion.replace(/\s*([{}[\],:])\s*/g, '$1');
      suggestion = suggestion.replace(/"\s*:\s*"/g, '":"');
      suggestion = suggestion.replace(/"\s*:\s*(\d+)/g, '":$1');
      suggestion = suggestion.replace(/(\d+)\s*,\s*"/g, '$1,"');
      suggestion = suggestion.replace(/(\d+)\s*,\s*(\d+)/g, '$1,$2');

      // Eliminar espacios en blanco dentro de las keys
      suggestion = suggestion.replace(/"([^"]*?)\s+([^"]*?)"\s*:/g, '"$1$2":');

      // Intentar nuevamente parsear
      try {
        JSON.parse(suggestion);
        result.suggestion = suggestion;
      } catch (innerError) {
        result.suggestion = null;
      }
      return result;
    }
  }

  private setVariablesFromTexts(): void {
    const form = this.type === 'LINK' ? this.form.get('tabItemConfigLink') : this.form;
    const link = this.type === 'LINK' ? 'link' : 'webserviceUrl';
    const htmls = [form.get(link).value, form.get('body').value, form.get('authUrl').value];
    let arrVariables: VariablesDTO[] = [];
    htmls.forEach((html) => {
      const variablesOnText = this.listVariables.filter((variable) => {
        let variableUsed = false;
        this.listVariables.forEach((item: VariablesDTO) => {
          if (html && html.indexOf(`[${variable.name}]`) !== -1) {
            variableUsed = true;
          }
        });
        return variableUsed;
      });
      arrVariables = [...arrVariables, ...variablesOnText];
    });

    form.get('variables').setValue(arrVariables);
  }
}
