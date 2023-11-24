import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';

@Component({
  selector: 'app-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.scss']
})
export class InformationComponent implements OnInit {
  @Input() formTab: FormGroup;
  public labels = {
    required: marker('errors.required')
  };

  constructor() {}

  ngOnInit(): void {}
}
