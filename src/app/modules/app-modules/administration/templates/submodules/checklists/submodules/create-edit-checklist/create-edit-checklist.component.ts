/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, ChangeDetectionStrategy, ViewEncapsulation, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import TemplatesChecklistsDTO from '@data/models/templates/templates-checklists-dto';
import { TranslateService } from '@ngx-translate/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import $ from 'jquery';
import 'jqueryui';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-create-edit-checklist',
  templateUrl: './create-edit-checklist.component.html',
  styleUrls: ['./create-edit-checklist.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateEditChecklistComponent implements OnInit {
  public page: number;
  public checklistForm: UntypedFormGroup;
  public labels = {
    newCheckList: marker('administration.templates.checklists.new'),
    cheklistConfig: marker('administration.templates.checklists.config'),
    itemsInTemplate: marker('administration.templates.checklists.itemsInTemplate'),
    text: marker('administration.templates.checklists.text'),
    sign: marker('administration.templates.checklists.sign'),
    freeDraw: marker('administration.templates.checklists.freeDraw'),
    check: marker('administration.templates.checklists.check'),
    var: marker('administration.templates.checklists.var'),
    image: marker('administration.templates.checklists.image')
  };
  private pdfLoaded = false;
  private canvasSetted: string[] = [];
  private checklistToEdit: TemplatesChecklistsDTO = null;

  constructor(
    private fb: UntypedFormBuilder,
    private spinnerService: ProgressSpinnerDialogService,
    private confirmDialogService: ConfirmDialogService,
    private translateService: TranslateService,
    private globalMessageService: GlobalMessageService,
    private logger: NGXLogger
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  public getTitle(): string {
    if (this.checklistForm?.value?.template?.name) {
      return this.checklistForm.value.template.name;
    }
    return this.translateService.instant(this.labels.newCheckList);
  }

  public pdfLoadedFn($event: any) {
    $('.checklistItemToDrag').draggable({ revert: true, cursor: 'grabbing' });
    this.pdfLoaded = true;
    this.configCanvas();
  }

  public changePage(page: number) {
    console.log(page);
    if (page && this.page !== page) {
      this.page = page;
    }
  }

  public save() {
    const dataToSave: any = {};
    Array.from(document.getElementById('checklistPDF').getElementsByClassName('page')).forEach((page: Element) => {
      const pageNumber = page.getAttribute('data-page-number');
      const pageW = $(page).width();
      const pageH = $(page).height();
      dataToSave['page-' + pageNumber] = [];
      Array.from(page.getElementsByClassName('dropped')).forEach((dropped: any) => {
        let extraData = dropped
          .getElementsByClassName('resizable')
          .item(0)
          .getElementsByTagName('div')
          .item(0)
          .getAttribute('data-extra');
        extraData = extraData ? extraData : {};
        dataToSave['page-' + pageNumber].push({
          page: {
            width: pageW,
            height: pageH
          },
          position: {
            topPx: dropped.style.top,
            leftPx: dropped.style.left,
            top: this.pxToPercentage(pageH, parseInt(dropped.style.top.split('px').join(), 10)),
            left: this.pxToPercentage(pageW, parseInt(dropped.style.left.split('px').join(), 10))
          },
          itemToInsert: {
            id: dropped.getElementsByClassName('resizable').item(0).getElementsByTagName('div').item(0).getAttribute('class'),
            data: extraData,
            widthPx: $(dropped).width(),
            heightPx: $(dropped).height(),
            width: this.pxToPercentage(pageW, $(dropped).width()),
            height: this.pxToPercentage(pageH, $(dropped).height())
          }
        });
      });
    });
    console.log(dataToSave);
    // this.setDrawZone(dataToSave);
  }

  public configCanvas($event?: any): void {
    if (this.pdfLoaded) {
      // console.log('config canvas', $event);
      Array.from(document.getElementById('checklistPDF').getElementsByClassName('page')).forEach((page: Element) => {
        const pageNumber = page.getAttribute('data-page-number');
        const loaded = page.getAttribute('data-loaded');
        // console.log(pageNumber, loaded);
        if (loaded && this.canvasSetted.indexOf(pageNumber) === -1) {
          const canvas = page.getElementsByClassName('canvasWrapper').item(0); //.getElementsByTagName('canvas').item(0);
          console.log(pageNumber, loaded, canvas);
          canvas.classList.add('canvasDropZone-page' + pageNumber);

          setTimeout(() => {
            $('.canvasDropZone-page' + pageNumber).droppable({
              drop: (event, ui) => {
                const item = ui.draggable;
                console.log(ui.offset, $('.canvasDropZone-page' + pageNumber).offset());
                if (!item.hasClass('dropped')) {
                  const uniqueId = new Date().getTime();
                  const newItem = item.clone();
                  newItem.addClass('dropped');
                  newItem.attr('id', uniqueId);
                  newItem.children('.resizable').resizable();
                  // {
                  //   handles: 'n, e, s, w, nw, ne, sw, se'
                  // }
                  newItem.appendTo($('.canvasDropZone-page' + pageNumber));
                  newItem.draggable({
                    containment: $('.canvasDropZone-page' + pageNumber)
                  });
                  //Lo posiciono en el centro
                  // newItem.css({
                  //   top: $('.canvasDropZone-page' + pageNumber).height() / 2 - newItem.height() / 2,
                  //   left: $('.canvasDropZone-page' + pageNumber).width() / 2 - newItem.width() / 2
                  // });
                  //Los +20 es porque la tarjeta tiene un margin de 20, lo mejor sería quitarlo
                  newItem.css({
                    top: ui.offset.top + 20 - $('.canvasDropZone-page' + pageNumber).offset().top,
                    left: ui.offset.left + 20 - $('.canvasDropZone-page' + pageNumber).offset().left
                  });
                } else {
                  return true;
                }
              }
            });
            this.canvasSetted.push(pageNumber);
          });
        }
      });
    }
  }

  private pxToPercentage(cien: number, x: number) {
    // cien => 100%
    // x => return
    return (100 * x) / cien;
  }

  private initForm() {
    const checklistItems: UntypedFormGroup[] = [];
    if (this.checklistToEdit) {
      console.log('Hacer algo aquí', this.checklistToEdit);
    }
    this.checklistForm = this.fb.group({
      id: [null],
      includeFile: [false],
      //TemplatesCommonDTO;
      template: this.fb.group({
        id: [null],
        name: [null, Validators.required],
        facilities: [[], Validators.required],
        brands: [[], Validators.required],
        departments: [[]],
        specialties: [[]],
        templateType: ['CHECKLISTS']
      }),
      //TemplateChecklistItemDTO[];
      templateChecklistItems: this.fb.array(checklistItems, [Validators.required]),
      //AttachmentDTO;
      templateFile: this.fb.group({
        content: [null],
        id: [null],
        name: [null],
        size: [null],
        thumbnail: [null],
        type: ['application/pdf']
      })
    });
    console.log(this.checklistForm);
  }
}
