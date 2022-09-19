import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { moveItemInFormArray } from '@shared/utils/moveItemInFormArray';

@Component({
  selector: 'app-entity-tab',
  templateUrl: './entity-tab.component.html',
  styleUrls: ['./entity-tab.component.scss']
})
export class EntityTabComponent implements OnInit, OnChanges {
  @Input() entityAttributesFormArray: FormArray;
  @Output() entityAttributesFormArrayChange = new EventEmitter<FormArray>();
  public labels = {
    entityTabConfiguration: marker('cards.column.entityTabConfiguration')
  };
  constructor() {}

  ngOnInit(): void {}
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.entityAttributesFormArray) {
      // console.log(this.entityAttributesFormArray);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public showEntityAttr = (item: FormGroup) => {
    item.get('tabItemConfigVariable.visible').setValue(!item.get('tabItemConfigVariable.visible').value);
  };

  public drop(event: CdkDragDrop<string[]>) {
    moveItemInFormArray(this.entityAttributesFormArray, event.previousIndex, event.currentIndex);
  }
}
