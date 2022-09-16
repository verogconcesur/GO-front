import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-entity-tab',
  templateUrl: './entity-tab.component.html',
  styleUrls: ['./entity-tab.component.scss']
})
export class EntityTabComponent implements OnInit, OnChanges {
  @Input() entityAttributesFormArray: FormGroup[];
  @Output() entityAttributesFormArrayChange = new EventEmitter<FormArray>();
  constructor() {}

  ngOnInit(): void {}
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.entityAttributesFormArray) {
      console.log(this.entityAttributesFormArray);
    }
  }
}
