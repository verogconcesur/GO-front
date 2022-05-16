import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CustomDialogButtonConfig } from '../../models/custom-dialog-button-config';

@Component({
  selector: 'app-custom-dialog-buttons-wrapper',
  templateUrl: './custom-dialog-buttons-wrapper.component.html',
  styleUrls: ['./custom-dialog-buttons-wrapper.component.scss']
})
export class CustomDialogButtonsWrapperComponent implements OnInit {
  @Input() buttons: CustomDialogButtonConfig[];
  @Output() buttonClick: EventEmitter<CustomDialogButtonConfig> = new EventEmitter();

  constructor() {}

  ngOnInit(): void {}
}
