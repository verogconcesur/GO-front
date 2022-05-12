import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CustomDialogFooterConfig } from '../../models/custom-dialog-footer-config';

@Component({
  selector: 'app-custom-dialog-footer',
  templateUrl: './custom-dialog-footer.component.html',
  styleUrls: ['./custom-dialog-footer.component.scss']
})
export class CustomDialogFooterComponent implements OnInit {
  @Input() config: CustomDialogFooterConfig;
  @Output() close: EventEmitter<boolean> = new EventEmitter();
  @Output() submit: EventEmitter<boolean> = new EventEmitter();

  constructor() {}

  ngOnInit(): void {}
}
