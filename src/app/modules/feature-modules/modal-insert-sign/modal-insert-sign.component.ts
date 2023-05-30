import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { ComponentToExtendForCustomDialog, CustomDialogFooterConfigI } from '@jenga/custom-dialog';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import SignaturePad from 'signature_pad';
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
  private canvas: HTMLCanvasElement = null;
  private signaturePad: SignaturePad;

  constructor(private fb: UntypedFormBuilder, private translateService: TranslateService) {
    super(InsertSignComponentModalEnum.ID, InsertSignComponentModalEnum.PANEL_CLASS, marker('common.addSign'));
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.setDrawZone();
  }

  public setDrawZone(): void {
    this.canvas = document.getElementById('sign-canvas') as HTMLCanvasElement;
    this.signaturePad = new SignaturePad(this.canvas);
  }

  ngOnDestroy(): void {}

  public deleteSignature = (): void => {
    this.signaturePad.clear();
  };

  //Abstract methods
  public confirmCloseCustomDialog(): Observable<boolean> {
    return of(true);
  }

  public onSubmitCustomDialog(): Observable<boolean | string> {
    return of(this.signaturePad.toDataURL());
  }

  public setAndGetFooterConfig(): CustomDialogFooterConfigI | null {
    return {
      show: true,
      rightSideButtons: [
        {
          type: 'submit',
          label: marker('common.confirm'),
          design: 'raised',
          color: 'primary'
        }
      ],
      leftSideButtons: [
        {
          type: 'custom',
          label: marker('common.erase'),
          design: 'raised',
          color: '',
          iconName: 'delete_outline',
          iconPosition: 'end',
          clickFn: this.deleteSignature
        }
      ]
    };
  }
}
