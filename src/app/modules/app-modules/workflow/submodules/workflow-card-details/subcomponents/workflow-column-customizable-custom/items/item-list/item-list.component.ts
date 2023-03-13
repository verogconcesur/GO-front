import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CardColumnTabDTO from '@data/models/cards/card-column-tab-dto';
import CardColumnTabItemDTO, { TabItemConfigListItemDTO } from '@data/models/cards/card-column-tab-item-dto';
import CardInstanceDTO from '@data/models/cards/card-instance-dto';

@Component({
  selector: 'app-item-list',
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.scss']
})
export class ItemListComponent implements OnInit {
  @Input() tab: CardColumnTabDTO;
  @Input() cardInstance: CardInstanceDTO;
  @Input() tabItem: CardColumnTabItemDTO;
  @Input() tabItemForm: FormGroup;
  @Input() tabForm: FormArray;
  @Input() editMode: boolean;
  public listItems: TabItemConfigListItemDTO[] = [];
  public labels = {
    required: marker('errors.required')
  };
  constructor() {}
  public getOptions(valueCode: string) {
    this.listItems = this.tabItem.tabItemConfigList.listItems.filter(
      (listItem: TabItemConfigListItemDTO) => listItem.parentCode === valueCode
    );
  }
  removeValue(): void {
    this.tabItemForm.get('value').setValue(null);
  }
  ngOnInit(): void {
    if (!this.tabItem.tabItemConfigList.parentCode) {
      this.listItems = this.tabItem.tabItemConfigList.listItems;
    } else {
      for (let i = 0; i < this.tabForm.controls.length; i++) {
        const tabItem = this.tabForm.at(i).get('tabItem').value as CardColumnTabItemDTO;
        if (tabItem.tabItemConfigList && tabItem.tabItemConfigList.code === this.tabItem.tabItemConfigList.parentCode) {
          this.tabForm
            .at(i)
            .get('value')
            .valueChanges.subscribe((res) => {
              this.tabItemForm.get('value').setValue(null);
              this.getOptions(res);
            });
          this.getOptions(this.tabForm.at(i).get('value').value);
        }
      }
    }
  }
}
