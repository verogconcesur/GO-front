/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, EventEmitter, Input, NgZone, OnInit, Output } from '@angular/core';
import { CustomDialogService } from '@jenga/custom-dialog';
import { Delta } from 'quill';
import { QuillTextEditorWrapperConfigI } from './interfaces/quill-text-editor-wrapper-config.interface';
import {
  QuillTextEditorHtmlDialogComponent,
  QuillTextEditorHtmlDialogComponentModalEnum
} from './quill-text-editor-html-dialog/quill-text-editor-html-dialog.component';
import { take } from 'rxjs/operators';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { TranslateService } from '@ngx-translate/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';

@Component({
  selector: 'app-quill-text-editor-wrapper',
  templateUrl: './quill-text-editor-wrapper.component.html',
  styleUrls: ['./quill-text-editor-wrapper.component.scss']
})
export class QuillTextEditorWrapperComponent implements OnInit {
  @Input() initialValue: string;
  @Input() placeholder: string;
  @Input() quillEditorOptionsConfig: QuillTextEditorWrapperConfigI;
  @Input() customClass: string;
  @Output() onContentChanged = new EventEmitter();
  public quillEditor: any;
  public quillToolbarOptions: any = null;
  private QL_INERTION_KEY = '[#qlINSERTION#]';

  constructor(
    private customDialogService: CustomDialogService,
    private confirmationDialog: ConfirmDialogService,
    private translateService: TranslateService,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    this.setQuillToolbarOptions();
  }

  public editorCreated(editorInstance: any) {
    this.quillEditor = editorInstance;
    if (this.customClass) {
      document.getElementById(this.customClass).getElementsByClassName('ql-editor').item(0).classList.add(this.customClass);
    }

    //Añadimos capa visualización
    // const node = document.createElement('div');
    // node.setAttribute('id', `${this.customClass}-html`);
    // node.setAttribute('data-placeholder', this.translateService.instant(this.placeholder));
    // node.setAttribute('contenteditable', 'true');
    // node.setAttribute('class', `ql-editor`);
    // document.getElementById(this.customClass).getElementsByClassName('ql-container').item(0).appendChild(node);

    if (this.initialValue) {
      this.quillEditor.root.innerHTML = this.initialValue;
    }

    // setTimeout(() => {
    //   //Changes in QuillEditor
    //   document.getElementsByClassName(`ql-editor ${this.customClass}`)[0].addEventListener(
    //     'input',
    //     () => {
    //       console.log('change in quill editor');
    //       document.getElementById(`${this.customClass}-html`).innerHTML = document.getElementsByClassName(
    //         `ql-editor ${this.customClass}`
    //       )[0].innerHTML;
    //     },
    //     true
    //   );
    //   //Changes in HTMl aux
    //   document.getElementById(`${this.customClass}-html`).addEventListener(
    //     'input',
    //     () => {
    //       console.log('change in html aux');
    //       document.getElementsByClassName(`ql-editor ${this.customClass}`)[0].innerHTML = document.getElementById(
    //         `${this.customClass}-html`
    //       ).innerHTML;
    //       console.log(window.getSelection().anchorNode.parentNode);
    //     },
    //     true
    //   );
    // });
  }

  private setQuillToolbarOptions() {
    const extraOption: any[] = ['blockquote', 'link', 'image'];
    let handlers = {};
    if (this.quillEditorOptionsConfig?.addHtmlInsertionOption) {
      extraOption.push('code-block');
      handlers = {
        ...handlers,
        'code-block': (data: any, oldContents: Delta, source: string) => {
          const range = this.quillEditor.getSelection();
          if (range) {
            // The zone.run is used because the button is clicked through an external library, if we don't write it the dialog is opened but not rendered
            this.zone.run(() => {
              this.customDialogService
                .open({
                  component: QuillTextEditorHtmlDialogComponent,
                  id: QuillTextEditorHtmlDialogComponentModalEnum.ID,
                  panelClass: QuillTextEditorHtmlDialogComponentModalEnum.PANEL_CLASS,
                  disableClose: true,
                  width: '350px'
                })
                .pipe(take(1))
                .subscribe((response) => {
                  if (response && this.isHtmlValid(response)) {
                    // this.insertHtmlOnCursorPosition(response);
                    this.quillEditor.clipboard.dangerouslyPasteHTML(range.index, response, 'api');
                    // const clipboard = this.quillEditor.getModule('clipboard');
                    // const pastedDelta = clipboard.convert({ html: response, text: '' });
                    // console.log(pastedDelta);
                    // const delta = new Delta().retain(range.index).delete(range.length).concat(pastedDelta);
                    // this.quillEditor.updateContents(delta, 'user');
                  }
                });
            });
          }
        }
      };
    }
    if (this.quillEditorOptionsConfig?.addHtmlInsertionOption && this.quillEditorOptionsConfig.variablesOpt?.length > 0) {
      extraOption.push({
        variablesOpt: this.quillEditorOptionsConfig.variablesOpt
      });
      handlers = {
        ...handlers,
        variablesOpt: (data: any) => {
          const range = this.quillEditor.getSelection();
          if (range) {
            this.quillEditor.insertText(range.index, data + ' ', { bold: true, color: 'blue' }, false);
            this.quillEditor.removeFormat(range.index + data.length, 1);
          }
        }
      };
    }
    this.quillToolbarOptions = {
      toolbar: {
        container: [
          [
            'bold',
            'italic',
            'underline',
            'strike',
            'clean',
            { font: [] as string[] },
            { color: [] as string[] },
            { background: [] as string[] }
          ],
          [{ header: [1, 2, 3, 4, 5, 6, false] }, { align: [] as string[] }],
          [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }, { direction: 'rtl' }],
          extraOption
        ],
        handlers
      }
    };
  }

  private insertHtmlOnCursorPosition = (html: string): void => {
    let sel;
    let range: Range;
    if (window.getSelection) {
      sel = window.getSelection();
      if (sel.getRangeAt && sel.rangeCount) {
        range = sel.getRangeAt(0);
        range.deleteContents();

        const target = document.createTextNode(this.QL_INERTION_KEY);
        range.insertNode(target);

        const qlHtml = document.getElementsByClassName(`ql-editor ${this.customClass}`)[0].innerHTML + '<br>';
        let qlHtml2;
        if (qlHtml.indexOf(`<p>${this.QL_INERTION_KEY}</p>`) >= 0) {
          qlHtml2 = qlHtml.split(`<p>${this.QL_INERTION_KEY}</p>`).join(html);
        } else if (qlHtml.indexOf(`<p>${this.QL_INERTION_KEY}<br></p>`) >= 0) {
          qlHtml2 = qlHtml.split(`<p>${this.QL_INERTION_KEY}<br></p>`).join(html);
        } else if (qlHtml.indexOf(this.QL_INERTION_KEY) >= 0) {
          qlHtml2 = qlHtml.split(this.QL_INERTION_KEY).join(html);
        }
        // document.getElementsByClassName(`ql-editor ${this.customClass}`)[0].innerHTML = qlHtml;
        document.getElementById(`${this.customClass}-html`).innerHTML = qlHtml2;
      }
    }
  };

  private isHtmlValid = (html: string): boolean => {
    const tagsToCheck = [
      '<input ',
      '< input ',
      '<textarea ',
      '< textarea ',
      '<button ',
      '< button ',
      '<select ',
      '< select ',
      '<canvas ',
      '< canvas ',
      '<iframe ',
      '< iframe ',
      '<script ',
      '< script ',
      '<object ',
      '< object ',
      '<option ',
      '< option '
    ];
    const tagsFound: string[] = [];
    tagsToCheck.forEach((tag) => {
      if (html.indexOf(tag) >= 0) {
        tagsFound.push(tag.split('<').join('').split(' ').join(''));
      }
    });
    if (tagsFound.length > 0) {
      this.confirmationDialog.open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('quill.invalidHtmlText'), { tags: tagsFound.join(', ') }),
        yesActionText: '',
        noActionText: this.translateService.instant(marker('common.close'))
      });
      return false;
    }
    return true;
  };
}
