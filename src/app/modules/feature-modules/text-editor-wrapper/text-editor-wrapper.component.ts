import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import $ from 'jquery';
import { TextEditorWrapperConfigI } from './interfaces/text-editor-wrapper-config.interface';

@Component({
  selector: 'app-text-editor-wrapper',
  templateUrl: './text-editor-wrapper.component.html',
  styleUrls: ['./text-editor-wrapper.component.scss']
})
export class TextEditorWrapperComponent implements OnInit, AfterViewInit {
  @Input() textEditorId: string;
  @Input() initialValue: string;
  @Input() placeholder: string;
  @Input() textEditorOptionsConfig: TextEditorWrapperConfigI;
  @Output() onContentChanged = new EventEmitter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public summerNoteconfig: any;
  //Styles used to mantain the styles used by summernote on export
  private summernoteStyles =
    // eslint-disable-next-line max-len
    '<style><!--SummernoteStyles-->table{border-collapse:collapse;width:100%}table td, table th{border:1px solid #ececec;padding:5px 3px}table.table-no-bordered td, table.table-no-bordered th{border:0px;}a{background-color:inherit;color:#337ab7;font-family:inherit;font-weight:inherit;text-decoration:inherit}a:focus, a:hover{color:#23527c;outline:0;text-decoration:underline}figure{margin:0}</style>';
  private summernoteNode: Element;
  private lang: string;

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
      const misc = ['fullscreen'];
      if (this.textEditorOptionsConfig && this.textEditorOptionsConfig.addHtmlModificationOption) {
        misc.push('codeview');
      }
      if (this.textEditorOptionsConfig && this.textEditorOptionsConfig.addVariablesInsertionOption) {
        //TODO: DGDC crear función semejante a 'tableHeaders', 'tableBorderToggle' para crear una lista de opciones
        misc.push('varOptions');
      }
      misc.push('help');

      this.summerNoteconfig = {
        lang: this.lang,
        id: this.textEditorId,
        pluginsTooltipTranslations: {
          tableHeaders: this.translateService.instant(marker('textEditor.tooltips.tableHeaders')),
          tableBorderToggle: this.translateService.instant(marker('textEditor.tooltips.tableBorderToggle')),
          varOptions: this.translateService.instant(marker('textEditor.tooltips.varOptions'))
        },
        placeholder: this.placeholder,
        toolbar: [
          // [groupName, [list of button]]
          ['style', ['style', 'bold', 'italic', 'underline', 'clear']],
          ['font', ['fontname', 'color']], //'fontsize'
          ['para', ['ul', 'ol', 'paragraph']],
          ['insert', ['table', 'link', 'picture', 'video']],
          ['misc', misc]
        ],
        popover: {
          table: [
            ['add', ['addRowDown', 'addRowUp', 'addColLeft', 'addColRight']],
            ['delete', ['deleteRow', 'deleteCol', 'deleteTable']],
            ['custom', ['tableHeaders', 'tableBorderToggle']]
          ]
        },
        callbacks: {
          onChange: () => {
            let html = this.summernoteNode.innerHTML;
            if (
              html.indexOf('<!--SummernoteStyles-->') === -1 &&
              (html.indexOf('<table') >= 0 || html.indexOf('< table') >= 0 || html.indexOf('<a') >= 0 || html.indexOf('< a') >= 0)
            ) {
              html = `${this.summernoteStyles} ${html}`;
            }
            this.onContentChanged.emit(html);
          }
        }
      };
    }
  }

  ngAfterViewInit(): void {
    this.summernoteNode = document.getElementById(this.textEditorId).getElementsByClassName('note-editable').item(0);
  }
}
