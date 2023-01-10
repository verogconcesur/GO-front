/* eslint-disable object-shorthand */
/* eslint-disable space-before-function-paren */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { TextEditorWrapperConfigI } from './interfaces/text-editor-wrapper-config.interface';
import $ from 'jquery';

@Component({
  selector: 'app-text-editor-wrapper, [appTextEditorWrapper]',
  templateUrl: './text-editor-wrapper.component.html',
  styleUrls: ['./text-editor-wrapper.component.scss']
})
export class TextEditorWrapperComponent implements OnInit, AfterViewInit {
  @Input() textEditorId: string;
  @Input() initialValue: string;
  @Input() placeholder: string;
  @Input() textEditorConfig: TextEditorWrapperConfigI;
  @Output() contentChanged = new EventEmitter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public summerNoteconfig: any;
  //Styles used to mantain the styles used by summernote on export
  private summernoteStyles =
    // eslint-disable-next-line max-len
    '<style><!--SummernoteStyles-->table{border-collapse:collapse;width:100%}table td, table th{border:1px solid #ececec;padding:5px 3px}table.table-no-bordered td, table.table-no-bordered th{border:0px;}a{background-color:inherit;color:#337ab7;font-family:inherit;font-weight:inherit;text-decoration:inherit}a:focus, a:hover{color:#23527c;outline:0;text-decoration:underline}figure{margin:0}</style>';
  private summernoteNode: any;
  private lang: string;
  private sumernoteHtmlContent = '';

  constructor(private translateService: TranslateService) {
    if (this.translateService.currentLang === 'en') {
      this.lang = `${this.translateService.currentLang}-US`;
    } else {
      this.lang = `${this.translateService.currentLang}-${this.translateService.currentLang.toUpperCase()}`;
    }
  }

  ngOnInit(): void {
    if (!this.textEditorId || !document.getElementById(this.textEditorId)) {
      console.error('No id defined for text editor wrapper', this.textEditorId);
    } else {
      const misc: any[] = ['fullscreen'];
      let extra: any = {};
      if (this.textEditorConfig && this.textEditorConfig.addHtmlModificationOption && !this.textEditorConfig.onlyMacroOption) {
        misc.push('codeview');
      }
      if (this.textEditorConfig && this.textEditorConfig.addMacroListOption) {
        misc.push(['macroList']);
        extra = {
          ...extra,
          macroList: {
            blockChar: ['[', ']'],
            tooltip: this.translateService.instant(marker('textEditor.tooltips.varOptions')),
            items: [...this.textEditorConfig.macroListOptions]
          }
        };
      }
      if (this.textEditorConfig && this.textEditorConfig.width) {
        extra = {
          ...extra,
          width: this.textEditorConfig.width
        };
      }
      if (this.textEditorConfig && this.textEditorConfig.height) {
        extra = {
          ...extra,
          height: this.textEditorConfig.height
        };
      }
      if (this.textEditorConfig && this.textEditorConfig.hintAutomplete?.length) {
        extra = {
          ...extra,
          hint: {
            mentions: this.textEditorConfig.hintAutomplete,
            match: /\B@(\w*)$/,
            // eslint-disable-next-line object-shorthand
            search: function (keyword: string, callback: any) {
              callback(
                // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
                $.grep(this.mentions, function (item: string) {
                  return item.toLowerCase().indexOf(keyword.toLowerCase()) === 0;
                })
              );
            },
            content: (item: string) => $('<span><b contenteditable="false" readonly="readonly"> @' + item + ' </b></span>')[0]
          }
        };
      }
      misc.push('help');
      let toolbar: any[];
      if (this.textEditorConfig.onlyMacroOption) {
        toolbar = [];
      } else {
        toolbar = [
          // [groupName, [list of button]]
          ['style', ['style', 'bold', 'italic', 'underline', 'clear']],
          ['font', ['fontname', 'color']], //'fontsize'
          ['para', ['ul', 'ol', 'paragraph']],
          ['insert', ['table', 'link', 'picture', 'video']]
        ];
      }
      if (misc && misc.length) {
        toolbar.push(['misc', misc]);
      }

      if (this.textEditorConfig.hideToolbar) {
        extra = {
          ...extra,
          toolbar: false
        };
      } else {
        extra = {
          ...extra,
          toolbar: toolbar
        };
      }

      this.summerNoteconfig = {
        lang: this.lang,
        id: this.textEditorId,
        pluginsTooltipTranslations: {
          tableHeaders: this.translateService.instant(marker('textEditor.tooltips.tableHeaders')),
          tableBorderToggle: this.translateService.instant(marker('textEditor.tooltips.tableBorderToggle'))
        },
        placeholder: this.placeholder,
        disableResizeEditor: this.textEditorConfig.disableResizeEditor ? true : false,
        disableDragAndDrop: this.textEditorConfig.disableDragAndDrop ? true : false,
        airMode: this.textEditorConfig.airMode ? true : false,
        popover: {
          table: [
            ['add', ['addRowDown', 'addRowUp', 'addColLeft', 'addColRight']],
            ['delete', ['deleteRow', 'deleteCol', 'deleteTable']],
            ['custom', ['tableHeaders', 'tableBorderToggle']]
          ]
        },
        ...extra,
        callbacks: {
          onChange: () => {
            let html = this.summernoteNode.innerHTML;
            if (
              html.indexOf('<!--SummernoteStyles-->') === -1 &&
              (html.indexOf('<table') >= 0 || html.indexOf('< table') >= 0 || html.indexOf('<a') >= 0 || html.indexOf('< a') >= 0)
            ) {
              html = `${this.summernoteStyles} ${html}`;
            }
            this.sumernoteHtmlContent = html;
            this.contentChanged.emit(html);
          }
        }
      };
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.summernoteNode = document.getElementById(this.textEditorId).getElementsByClassName('note-editable').item(0);
      this.addJqueryFn();
    }, 100);
  }

  public addJqueryFn(): void {
    $.fn.extend({
      placeCursorAtEnd: function () {
        // Places the cursor at the end of a contenteditable container (should also work for textarea / input)
        if (this.length === 0) {
          throw new Error('Cannot manipulate an element if there is no element!');
        }
        const el = this[0];
        const range = document.createRange();
        const sel = window.getSelection();
        const childLength = el.childNodes.length;
        if (childLength > 0) {
          const lastNode = el.childNodes[childLength - 1];
          const lastNodeChildren = lastNode.childNodes.length;
          range.setStart(lastNode, lastNodeChildren);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
        }
        return this;
      }
    });
  }

  public placeCursorAtEnd(subClass?: string): void {
    const item: any = $(`#${this.textEditorId} .note-editable`);
    item.placeCursorAtEnd();
  }
}
