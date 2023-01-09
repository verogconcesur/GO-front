/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, ChangeDetectionStrategy, HostListener, ViewEncapsulation } from '@angular/core';
import $ from 'jquery';
import 'jqueryui';
import p5 from 'p5';

@Component({
  selector: 'app-create-edit-checklist',
  templateUrl: './create-edit-checklist.component.html',
  styleUrls: ['./create-edit-checklist.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateEditChecklistComponent {
  public page: number;
  public pencilType: 'pencil' | 'brush' = 'pencil';
  public eraserActive = false;
  public smallModal = false;
  //fields
  public nombreCliente = 'Nombre cliente';
  public bilateral = true;
  public vivos = false;
  public patrimonial = false;
  public texto = 'Observaciones';

  private pdfLoaded = false;
  private canvasSetted: string[] = [];
  private p5: p5;
  private p5Firma: p5;
  private p5Firmas: { p5: p5; width: number; height: number }[] = [];

  constructor() {}
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    console.log(event.target.innerWidth);
    if (event.target.innerWidth < 1225) {
      this.smallModal = true;
    } else {
      this.smallModal = false;
    }
  }

  public pdfLoadedFn($event: any) {
    console.log('pdf loaded', $event);
    $('.itemToDrag').draggable({ revert: true });
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
    Array.from(document.getElementById('pruebaPDF').getElementsByClassName('page')).forEach((page: Element) => {
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
    this.setDrawZone(dataToSave);
  }

  public configCanvas($event?: any): void {
    if (this.pdfLoaded) {
      // console.log('config canvas', $event);
      Array.from(document.getElementById('pruebaPDF').getElementsByClassName('page')).forEach((page: Element) => {
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

  public setDrawZone(dataToSave: any): void {
    //Canvas firma
    new p5((p: any) => this.drawing1(p, 'firma_canvas_wrapper'));
    //Resto de canvas
    Object.keys(dataToSave).forEach((page) => {
      if (dataToSave[page]?.length) {
        dataToSave[page].forEach((item: any) => {
          if (item.itemToInsert.id === 'itemToDrag__dibujo' || item.itemToInsert.id === 'itemToDrag__firma') {
            //Insertamos canvas en esa posición
            const pageNumber = page.split('-')[1];
            // this.p5 = new p5(this.drawing);
            new p5((p: any) => this.drawing2(p, item));
            // console.log($('#paint-zone__canvas-wrapper .p5Canvas'));
            // console.log($('.canvasDropZone-page' + pageNumber));
            $('#paint-zone__canvas-wrapper .p5Canvas')
              .appendTo($('.canvasDropZone-page' + pageNumber))
              .addClass(item.itemToInsert.id)
              .css({
                position: 'absolute',
                top: item.position.topPx,
                left: item.position.leftPx,
                border: '1px solid black',
                'z-index': 5000
              });
          }
        });
      }
    });
    $('.itemToDrag').draggable('disable');
    $('.itemToDrag').draggable('destroy');
    $('.itemToDrag').remove();
  }

  public saveDrawing() {
    const { canvas } = this.p5.get() as unknown as {
      canvas: HTMLCanvasElement;
    };
    console.log(canvas.toDataURL());
  }

  public insertSign() {
    const { canvas } = this.p5Firma.get() as unknown as {
      canvas: HTMLCanvasElement;
    };
    this.p5Firmas.forEach((p: { p5: p5; width: number; height: number }) => {
      p.p5.clear(255, 255, 255, 1);
      p.p5.loadImage(canvas.toDataURL(), (newImage) => {
        p.p5.image(newImage, 0, 0, p.width, p.height);
      });
    });
  }

  public eraser() {
    this.eraserActive = !this.eraserActive;
  }

  public drawing1 = (p: p5, item: any) => {
    console.log(p, item);
    this.p5Firma = p;
    p.setup = () => {
      p.createCanvas(400, 200).parent(item);
      // p.background(200, 200, 200);
    };
    p.mouseDragged = (event) => {
      const type = this.pencilType;
      const size = parseInt($('#pen-size').val().toString(), 10);
      const color: string = $('#pen-color').val().toString();
      p.fill(color);
      p.stroke(color);
      if (this.eraserActive) {
        p.erase();
        p.strokeWeight(30);
        p.line(p.pmouseX, p.pmouseY, p.mouseX, p.mouseY);
      } else {
        p.noErase();
        if (type === 'pencil') {
          p.strokeWeight(size);
          p.line(p.pmouseX, p.pmouseY, p.mouseX, p.mouseY);
        } else {
          p.ellipse(p.mouseX, p.mouseY, size, size);
        }
      }
    };
  };

  public drawing2 = (p: p5, item: any) => {
    console.log(p, item);
    if (item.itemToInsert.id === 'itemToDrag__firma') {
      this.p5Firmas.push({ p5: p, width: item.itemToInsert.widthPx, height: item.itemToInsert.heightPx });
    } else {
      //Dibujo libre
      this.p5 = p;
    }
    p.setup = () => {
      //No usar px
      p.createCanvas(item.itemToInsert.widthPx, item.itemToInsert.heightPx).parent('paint-zone__canvas-wrapper');
      // p.background(0, 0, 0);
    };
    // p.loadImage(
    //   'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASQA.....',
    //   (newImage) => {
    //     console.log(newImage);
    //     p.image(newImage, 0, 0, item.itemToInsert.widthPx, item.itemToInsert.heightPx);
    //   }
    // );
    if (item.itemToInsert.id === 'itemToDrag__dibujo') {
      p.mouseDragged = (event) => {
        const type = this.pencilType;
        const size = parseInt($('#pen-size').val().toString(), 10);
        const color: string = $('#pen-color').val().toString();
        p.fill(color);
        p.stroke(color);
        if (this.eraserActive) {
          p.erase();
          p.strokeWeight(30);
          p.line(p.pmouseX, p.pmouseY, p.mouseX, p.mouseY);
        } else {
          p.noErase();
          if (type === 'pencil') {
            p.strokeWeight(size);
            p.line(p.pmouseX, p.pmouseY, p.mouseX, p.mouseY);
          } else {
            p.ellipse(p.mouseX, p.mouseY, size, size);
          }
        }
      };
    }
  };

  public get formData(): { [fieldName: string]: string | number | boolean } {
    return {
      'nombreCliente-page1': this.nombreCliente,
      'bilateral-page1': this.bilateral ? 'Yes' : null,
      'bilateral-page4': this.bilateral ? 'Yes' : null,
      'vivos-page1': this.vivos ? 'Yes' : null,
      'vivos-page4': this.vivos ? 'Yes' : null,
      'patrimonial-page1': this.patrimonial ? 'Yes' : null,
      'patrimonial-page4': this.patrimonial ? 'Yes' : null,
      'texto-page10': this.texto
    };
  }

  public set formData(data: { [fieldName: string]: string | number | boolean }) {
    this.nombreCliente = data['nombreCliente-page1'] as string;
    this.texto = data['texto-page10'] as string;

    if (this.bilateral !== (data['bilateral-page1'] === 'Yes' || data['bilateral-page1'] === true) ? true : false) {
      this.bilateral = data['bilateral-page1'] === 'Yes' || data['bilateral-page1'] === true ? true : false;
    } else if (this.bilateral !== (data['bilateral-page4'] === 'Yes' || data['bilateral-page4'] === true) ? true : false) {
      this.bilateral = data['bilateral-page4'] === 'Yes' || data['bilateral-page2'] === true ? true : false;
    }

    if (this.vivos !== (data['vivos-page1'] === 'Yes' || data['vivos-page1'] === true) ? true : false) {
      this.vivos = data['vivos-page1'] === 'Yes' || data['vivos-page1'] === true ? true : false;
    } else if ((this.vivos !== (data['vivos-page4'] === 'Yes' || data['vivos-page4'])) === true ? true : false) {
      this.vivos = data['vivos-page4'] === 'Yes' || data['vivos-page4'] === true ? true : false;
    }

    if ((this.patrimonial !== (data['patrimonial-page1'] === 'Yes' || data['patrimonial-page1'])) === true ? true : false) {
      this.patrimonial = data['patrimonial-page1'] === 'Yes' || data['patrimonial-page1'] === true ? true : false;
    } else if (
      (this.patrimonial !== (data['patrimonial-page4'] === 'Yes' || data['patrimonial-page4'])) === true ? true : false
    ) {
      this.patrimonial = data['patrimonial-page4'] === 'Yes' || data['patrimonial-page4'] === true ? true : false;
    }
  }

  private pxToPercentage(cien: number, x: number) {
    // cien => 100%
    // x => return
    return (100 * x) / cien;
  }
}
