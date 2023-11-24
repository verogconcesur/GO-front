import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { UntypedFormArray, UntypedFormGroup } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { moveItemInFormArray } from '@shared/utils/moveItemInFormArray';

@Component({
  selector: 'app-entity-tab',
  templateUrl: './entity-tab.component.html',
  styleUrls: ['./entity-tab.component.scss']
})
export class EntityTabComponent implements OnInit, OnChanges {
  @Input() entityAttributesFormArray: UntypedFormArray;
  @Output() entityAttributesFormArrayChange = new EventEmitter<UntypedFormArray>();
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
  public showEntityAttr = (item: UntypedFormGroup) => {
    item.get('tabItemConfigVariable.visible').setValue(!item.get('tabItemConfigVariable.visible').value);
  };

  public drop(event: CdkDragDrop<string[]>) {
    moveItemInFormArray(this.entityAttributesFormArray, event.previousIndex, event.currentIndex);
  }
}
