import { AfterViewInit, Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import p5 from 'p5';
import $ from 'jquery';
import 'jqueryui';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';

@Component({
  selector: 'app-change-sign',
  templateUrl: './change-sign.component.html',
  styleUrls: ['./change-sign.component.scss']
})
export class ChangeSignComponent implements OnInit, OnDestroy, AfterViewInit {
  @Output() closeEvent: EventEmitter<boolean> = new EventEmitter();
  @Output() saveEvent: EventEmitter<string> = new EventEmitter();
  public pencilType: 'pencil' | 'eraser' = 'pencil';
  public p5Sign: p5 = null;
  public labels = {
    save: marker('common.save')
  };

  constructor(private translateService: TranslateService) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.setDrawZone();
  }

  public setDrawZone(): void {
    new p5((p: p5) => this.configDrawingZone(p, 'paint-zone__canvas-wrapper'));
  }

  public configDrawingZone = (p: p5, id: string): void => {
    console.log('configDrawingZone => changeSignComponent');
    p.setup = () => {
      p.createCanvas(500, 250).parent(id);
    };
    p.mouseDragged = (event) => {
      let type = 'pencil';
      // if ($('#change-sign-pen-brush:checked').length) {
      //   type = 'brush';
      // } else
      if ($('#change-sign-pen-eraser:checked').length) {
        type = 'eraser';
      }
      const size = parseInt($('#change-sign-pen-size').val().toString(), 10);
      // const color = $('#change-sign-pen-color').val().toString();
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

  public cancelAction(): void {
    this.closeEvent.emit(true);
  }

  public confirmAction(): void {
    const { canvas } = this.p5Sign.get() as unknown as {
      canvas: HTMLCanvasElement;
    };
    this.saveEvent.emit(canvas.toDataURL());
  }

  ngOnDestroy(): void {
    console.log('Ondestroy change sign component');
    this.p5Sign.mouseDragged = (event) => {};
    this.p5Sign.mouseReleased = (event) => {};
    this.p5Sign.remove();
    this.p5Sign = null;
  }
}
