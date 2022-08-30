import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CardColumnTabDTO from '@data/models/cards/card-column-tab-dto';
import WorkflowCardSlotDTO from '@data/models/workflows/workflow-card-slot-dto';
import { CardService } from '@data/services/cards.service';
import { TranslateService } from '@ngx-translate/core';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-workflow-column-customizable-custom',
  templateUrl: './workflow-column-customizable-custom.component.html',
  styleUrls: ['./workflow-column-customizable-custom.component.scss']
})
export class WorkflowColumnCustomizableCustomComponent implements OnInit, OnChanges {
  @Input() tab: CardColumnTabDTO = null;
  @Output() setShowLoading: EventEmitter<boolean> = new EventEmitter(false);

  constructor(
    private cardService: CardService,
    private route: ActivatedRoute,
    private globalMessageService: GlobalMessageService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.tab) {
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
          (data: WorkflowCardSlotDTO[]) => {
            console.log(data);
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
}
