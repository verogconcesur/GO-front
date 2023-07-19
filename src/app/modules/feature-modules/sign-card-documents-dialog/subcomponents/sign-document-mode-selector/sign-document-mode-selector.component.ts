import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';

@Component({
  selector: 'app-sign-document-mode-selector',
  templateUrl: './sign-document-mode-selector.component.html',
  styleUrls: ['./sign-document-mode-selector.component.scss']
})
export class SignDocumentModeSelectorComponent implements OnInit {
  @Output() modeSelected: EventEmitter<'REMOTE' | 'NO_REMOTE'> = new EventEmitter();
  public labels = {
    signModeTitle: marker('administration.templates.sign.modeTitle'),
    remoteMode: marker('administration.templates.sign.remoteMode'),
    noRemoteMode: marker('administration.templates.sign.noRemoteMode')
  };
  constructor() {}

  ngOnInit(): void {}
}
