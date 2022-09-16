import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CardColumnTabDTO from '@data/models/cards/card-column-tab-dto';
import WorkflowCardTabItemDTO from '@data/models/workflows/workflow-card-tab-item-dto';
import { CardService } from '@data/services/cards.service';
import { TranslateService } from '@ngx-translate/core';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-workflow-column-customizable-entity',
  templateUrl: './workflow-column-customizable-entity.component.html',
  styleUrls: ['./workflow-column-customizable-entity.component.scss']
})
export class WorkflowColumnCustomizableEntityComponent implements OnInit, OnChanges {
  @Input() tab: CardColumnTabDTO = null;
  @Output() setShowLoading: EventEmitter<boolean> = new EventEmitter(false);

  public labels = {
    noDataToShow: marker('errors.noDataToShow')
  };

  public entityData: WorkflowCardTabItemDTO[] = [];

  constructor(
    private cardService: CardService,
    private route: ActivatedRoute,
    private globalMessageService: GlobalMessageService,
    private translateService: TranslateService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.tab) {
      this.entityData = [];
      this.getData();
    }
  }

  public getData(): void {
    //Cogemos el cardInstanceWorkflowId de la ruta
    if (this.route?.snapshot?.params?.id) {
      this.setShowLoading.emit(true);
      this.cardService
        .getCardTabData(parseInt(this.route?.snapshot?.params?.id, 10), this.tab.id)
        .pipe(take(1))
        .subscribe(
          (data: WorkflowCardTabItemDTO[]) => {
            this.entityData = data;
            this.setShowLoading.emit(false);
          },
          (error: ConcenetError) => {
            this.setShowLoading.emit(false);
            this.globalMessageService.showError({
              message: error.message,
              actionText: this.translateService.instant(marker('common.close'))
            });
          }
        );
    }
  }

  public getDataValue(data: WorkflowCardTabItemDTO): string | number {
    if (data.tabItemConfigVariable.variable.dataType.toUpperCase() === 'DATE') {
      return this.datePipe.transform(new Date(data.tabItemConfigVariable.variable.value), 'dd-MM-yyyy');
    } else if (data.tabItemConfigVariable.variable.dataType.toUpperCase() === 'DATETIME') {
      return this.datePipe.transform(new Date(data.tabItemConfigVariable.variable.value), 'dd-MM-yyyy, HH:mm');
    } else if (data.tabItemConfigVariable.variable.dataType.toUpperCase() === 'TIME') {
      return this.datePipe.transform(new Date(data.tabItemConfigVariable.variable.value), 'HH:mm');
    }
    return data.tabItemConfigVariable.variable.value;
  }
}
