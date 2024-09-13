import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CustomDialogHeaderConfigI } from '../../interfaces/custom-dialog-header-config';

@Component({
  selector: 'app-custom-dialog-header',
  templateUrl: './custom-dialog-header.component.html',
  styleUrls: ['./custom-dialog-header.component.scss'],
})
export class CustomDialogHeaderComponent {
  @Input() config!: CustomDialogHeaderConfigI;
  @Output() close: EventEmitter<boolean> = new EventEmitter();

  constructor() {}

  public getTitleLabel(): string {
    return this.config?.titleLabel ? this.config.titleLabel : '';
  }
}
