import { Component, OnInit } from '@angular/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { ComponentToExtendForCustomDialog, CustomDialogFooterConfigI } from '@jenga/custom-dialog';
import { Observable, of } from 'rxjs';

export const enum QuillTextEditorHtmlDialogComponentModalEnum {
  ID = 'quill-text-editor-html-insertion-id',
  PANEL_CLASS = 'quill-text-editor-html-insertion',
  TITLE = 'quill.htmlCodeInsertion'
}
@Component({
  selector: 'app-quill-text-editor-html-dialog',
  templateUrl: './quill-text-editor-html-dialog.component.html',
  styleUrls: ['./quill-text-editor-html-dialog.component.scss']
})
export class QuillTextEditorHtmlDialogComponent extends ComponentToExtendForCustomDialog implements OnInit {
  public html = '';

  constructor() {
    super(
      QuillTextEditorHtmlDialogComponentModalEnum.ID,
      QuillTextEditorHtmlDialogComponentModalEnum.PANEL_CLASS,
      marker('quill.htmlCodeInsertion')
    );
  }

  ngOnInit(): void {}

  public confirmCloseCustomDialog(): Observable<boolean> {
    return of(true);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public onSubmitCustomDialog(): Observable<any> {
    return of(this.html);
  }

  public setAndGetFooterConfig(): CustomDialogFooterConfigI | null {
    return {
      show: true,
      rightSideButtons: [
        {
          type: 'submit',
          label: marker('common.insert'),
          design: 'raised',
          color: 'primary'
        }
      ]
    };
  }
}
