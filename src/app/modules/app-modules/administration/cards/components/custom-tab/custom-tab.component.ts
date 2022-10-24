import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, UntypedFormArray } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CardColumnTabItemDTO, { TabItemsCustomTypes } from '@data/models/cards/card-column-tab-item-dto';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { moveItemInFormArray } from '@shared/utils/moveItemInFormArray';
import { removeItemInFormArray } from '@shared/utils/removeItemInFormArray';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-custom-tab',
  templateUrl: './custom-tab.component.html',
  styleUrls: ['./custom-tab.component.scss']
})
export class CustomTabComponent implements OnInit {
  @Input() tabItems: UntypedFormArray;
  @Output() newTabItemEvent = new EventEmitter<string>();
  @Output() editTabItemEvent = new EventEmitter<CardColumnTabItemDTO>();
  public labels = {
    customTabConfiguration: marker('cards.column.tabConfiguration')
  };
  public itemTypes = TabItemsCustomTypes;
  constructor(private confirmationDialog: ConfirmDialogService, private translateService: TranslateService) {}

  ngOnInit(): void {}

  public newTabitem(typeItem: string): void {
    this.newTabItemEvent.emit(typeItem);
  }
  public editTabItem(tabItem: FormGroup): void {
    this.editTabItemEvent.emit(tabItem.getRawValue() as CardColumnTabItemDTO);
  }
  public deleteTabitem(tabItem: FormGroup): void {
    this.confirmationDialog
      .open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('cards.column.deleteTabConfirmation'))
      })
      .pipe(take(1))
      .subscribe((ok: boolean) => {
        if (ok) {
          removeItemInFormArray(this.tabItems, tabItem.value.orderNumber - 1);
        }
      });
  }
  public drop(event: CdkDragDrop<string[]>) {
    moveItemInFormArray(this.tabItems, event.previousIndex, event.currentIndex);
  }
}
