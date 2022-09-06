import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CardColumnDTO from '@data/models/cards/card-column-dto';

@Component({
  selector: 'app-custom-comments',
  templateUrl: './custom-comments.component.html',
  styleUrls: ['./custom-comments.component.scss']
})
export class CustomCommentsComponent implements OnInit {
  @Input() formCol: FormGroup;
  @Input() colEdit: CardColumnDTO;
  public labels = {
    name: marker('cards.column.columnName'),
    nameRequired: marker('userProfile.nameRequired')
  };

  constructor() { }
  get form() {
    return this.formCol.controls;
  }
  get tabs() {
    return this.formCol.controls.tabs as FormArray;
  }

  ngOnInit(): void {
  }

}
