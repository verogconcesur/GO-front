import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { ComponentToExtendForCustomDialog, CustomDialogFooterConfigI } from '@jenga/custom-dialog';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import p5 from 'p5';
import $ from 'jquery';
import 'jqueryui';
export const enum InsertSignComponentModalEnum {
  ID = 'insert-sign-dialog-id',
  PANEL_CLASS = 'insert-sign-dialog',
  TITLE = 'common.addSign'
}
@Component({
  selector: 'app-modal-insert-sign',
  templateUrl: './modal-insert-sign.component.html',
  styleUrls: ['./modal-insert-sign.component.scss']
})
export class ModalInsertSignComponent extends ComponentToExtendForCustomDialog implements OnInit, AfterViewInit, OnDestroy {
  public pencilType: 'pencil' | 'brush' | 'eraser' = 'pencil';
  public p5Sign: p5 = null;

  constructor(private fb: UntypedFormBuilder, private translateService: TranslateService) {
    super(InsertSignComponentModalEnum.ID, InsertSignComponentModalEnum.PANEL_CLASS, marker('common.addSign'));
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.setDrawZone();
  }

  public setDrawZone(): void {
    new p5((p: p5) => this.configDrawingZone(p, 'paint-zone__canvas-wrapper'));
  }

  public configDrawingZone = (p: p5, id: string): void => {
    console.log('configDrawingZone => ModalInsertSignComponent');
    p.setup = () => {
      p.createCanvas(500, 250).parent(id);
    };
    p.mouseDragged = (event) => {
      let type = 'pencil';
      // if ($('#sign-pen-brush:checked').length) {
      //   type = 'brush';
      // } else
      if ($('#sign-pen-eraser:checked').length) {
        type = 'eraser';
      }
      const size = parseInt($('#sign-pen-size').val().toString(), 10);
      // const color = $('#sign-pen-color').val().toString();
      const color = '#000';
      p.fill(color);
      p.stroke(color);
      if (type === 'eraser') {
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
    this.p5Sign = p;
  };

  ngOnDestroy(): void {
    this.p5Sign.remove();
    this.p5Sign = null;
  }

  //Abstract methods
  public confirmCloseCustomDialog(): Observable<boolean> {
    return of(true);
  }

  public onSubmitCustomDialog(): Observable<boolean | string> {
    const { canvas } = this.p5Sign.get() as unknown as {
      canvas: HTMLCanvasElement;
    };
    return of(canvas.toDataURL());
  }

  public setAndGetFooterConfig(): CustomDialogFooterConfigI | null {
    return {
      show: true,
      leftSideButtons: [],
      rightSideButtons: [
        {
          type: 'submit',
          label: marker('common.confirm'),
          design: 'raised',
          color: 'primary'
        }
      ]
    };
  }
}
