import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CardColumnTabDTO from '@data/models/cards/card-column-tab-dto';
import { TranslateService } from '@ngx-translate/core';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { take } from 'rxjs/operators';
import { NGXLogger } from 'ngx-logger';
import CardInstanceDTO from '@data/models/cards/card-instance-dto';
// eslint-disable-next-line max-len
import CardInstanceAccountingConfig from '@modules/feature-modules/card-instance-accounting/card-instance-accounting-config-interface';
import { CardAccountingService } from '@data/services/card-accounting.service';
import { CardAccountingDTO } from '@data/models/cards/card-accounting-dto';

@Component({
  selector: 'app-workflow-column-templates-accounting',
  templateUrl: './workflow-column-templates-accounting.component.html',
  styleUrls: ['./workflow-column-templates-accounting.component.scss']
})
export class WorkflowColumnTemplatesAccountingComponent implements OnInit, OnChanges {
  @Input() tab: CardColumnTabDTO = null;
  @Input() cardInstance: CardInstanceDTO;
  @Output() setShowLoading: EventEmitter<boolean> = new EventEmitter(false);
  public labels = {
    noDataToShow: marker('errors.noDataToShow')
  };
  public idCard: number;
  public accountingData: CardAccountingDTO;
  public cardInstanceAccountingConfig: CardInstanceAccountingConfig;
  public dataLoaded = false;

  constructor(
    private cardAccountingService: CardAccountingService,
    private route: ActivatedRoute,
    private translateService: TranslateService,
    private globalMessageService: GlobalMessageService,
    private logger: NGXLogger
  ) {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.tab) {
      this.getDataAndSetConfig();
    }
  }

  public fetchData(): void {
    this.accountingData = null;
    this.dataLoaded = false;
    this.setShowLoading.emit(true);
    this.cardAccountingService
      .getCardAccounting(this.idCard, this.tab.id)
      .pipe(take(1))
      .subscribe(
        (data: CardAccountingDTO) => {
          this.setShowLoading.emit(false);
          this.accountingData = data;
          this.dataLoaded = true;
        },
        (error: ConcenetError) => {
          this.setShowLoading.emit(false);
          this.logger.error(error);
          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
          this.accountingData = null;
          this.dataLoaded = true;
        }
      );
  }

  private getDataAndSetConfig(): void {
    this.idCard = parseInt(this.route?.snapshot?.params?.idCard, 10);
    this.cardInstanceAccountingConfig = {
      tabId: this.tab.id,
      workflowId: this.cardInstance.workflowId,
      wcId: this.idCard,
      permission: this.tab.permissionType,
      disableAccountingAdditionAction: this.tab.permissionType !== 'EDIT' ? true : false,
      disableIndividualDeleteAction: this.tab.permissionType !== 'EDIT' ? true : false
    };
    this.fetchData();
  }
}
