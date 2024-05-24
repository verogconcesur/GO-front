import { Component, OnInit } from '@angular/core';
import { FormControl, UntypedFormGroup } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import VariablesDTO from '@data/models/variables-dto';
import { VariablesService } from '@data/services/variables.service';
import { ComponentToExtendForCustomDialog, CustomDialogFooterConfigI } from '@frontend/custom-dialog';
// eslint-disable-next-line max-len
import { TextEditorWrapperConfigI } from '@modules/feature-modules/text-editor-wrapper/interfaces/text-editor-wrapper-config.interface';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { title } from 'process';
import { Observable, map, of, take, tap } from 'rxjs';

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
  public form: UntypedFormGroup;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public originalFormValue: any;
  public textEditorToolbarOnlyMacroOptions: TextEditorWrapperConfigI = {
    onlyMacroOption: true,
    addMacroListOption: true,
    macroListOptions: [],
    width: 450
  };
  public labels = {
    title: marker('cards.column.links-dialog.title'),
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
    this.form = this.extendedComponentData.form;
    this.originalFormValue = this.form.value;
    this.listVariables = this.extendedComponentData.listVariables;
    console.log(this.form.value);
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
          disabledFn: () => !(this.form.touched && this.form.dirty && this.form.valid)
        }
      ]
    };
  }

  public textEditorContentChanged(html: string, field: string, plain?: boolean) {
    if (html !== this.form.get('tabItemConfigLink').get(field).value) {
      if (plain) {
        html = this.convertToPlain(html);
      }
      if ((html === '' || this.convertToPlain(html) === '') && html.length < 20) {
        html = null;
      }
      this.form.get('tabItemConfigLink').get(field).setValue(html, { emitEvent: true });
      this.setVariablesFromTexts();
    }
  }

  public convertToPlain(html: string) {
    const tempDivElement = document.createElement('div');
    tempDivElement.innerHTML = html;
    return tempDivElement.textContent || tempDivElement.innerText || '';
  }

  private setVariablesFromTexts(): void {
    //TODO: añadir resto de campos que pueden contener variables
    const htmls = [this.form.get('tabItemConfigLink').get('link').value];
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

    this.form.get('variables').setValue(arrVariables);
  }
}
