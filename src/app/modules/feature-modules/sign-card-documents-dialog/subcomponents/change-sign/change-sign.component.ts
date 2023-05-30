import { AfterViewInit, Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import p5 from 'p5';
import $ from 'jquery';
import 'jqueryui';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import SignaturePad from 'signature_pad';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-change-sign',
  templateUrl: './change-sign.component.html',
  styleUrls: ['./change-sign.component.scss']
})
export class ChangeSignComponent implements OnInit, OnDestroy, AfterViewInit {
  @Output() closeEvent: EventEmitter<boolean> = new EventEmitter();
  @Output() saveEvent: EventEmitter<string> = new EventEmitter();
  public labels = {
    save: marker('common.save'),
    erase: marker('common.erase')
  };
  public colorFormControl = new FormControl('#000');
  private canvas: HTMLCanvasElement = null;
  private signaturePad: SignaturePad;

  constructor(private translateService: TranslateService) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.setDrawZone();
  }

  public setDrawZone(): void {
    this.canvas = document.getElementById('sign-canvas') as HTMLCanvasElement;
    this.signaturePad = new SignaturePad(this.canvas);
  }

  public eraseSignature(): void {
    this.signaturePad.clear();
  }

  public colorChanged(): void {
    console.log(this.colorFormControl.value);
    this.signaturePad.penColor = this.colorFormControl.value;
  }

  public cancelAction(): void {
    this.closeEvent.emit(true);
  }

  public confirmAction(): void {
    this.saveEvent.emit(this.signaturePad.toDataURL());
  }

  ngOnDestroy(): void {}
}
