import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { CardBudgetsDTO } from '@data/models/cards/card-budgets-dto';
import CardColumnTabDTO from '@data/models/cards/card-column-tab-dto';
import { CardBudgetsService } from '@data/services/card-budgets.service';
import CardInstanceBudgetsConfig from '@modules/feature-modules/card-instance-budgets/card-instance-budgets-config-interface';
import { TranslateService } from '@ngx-translate/core';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { take } from 'rxjs/operators';
import { NGXLogger } from 'ngx-logger';
import CardInstanceDTO from '@data/models/cards/card-instance-dto';

@Component({
  selector: 'app-workflow-column-templates-budgets',
  templateUrl: './workflow-column-templates-budgets.component.html',
  styleUrls: ['./workflow-column-templates-budgets.component.scss']
})
export class WorkflowColumnTemplatesBudgetsComponent implements OnInit, OnChanges {
  @Input() tab: CardColumnTabDTO = null;
  @Input() cardInstance: CardInstanceDTO;
  @Output() setShowLoading: EventEmitter<boolean> = new EventEmitter(false);
  public labels = {
    noDataToShow: marker('errors.noDataToShow')
  };
  public idCard: number;
  public budgetsAndTemplatesData: CardBudgetsDTO[];
  public cardInstanceBudgetsConfig: CardInstanceBudgetsConfig;
  public dataLoaded = false;

  constructor(
    private cardBudgetsService: CardBudgetsService,
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
    this.budgetsAndTemplatesData = [];
    this.dataLoaded = false;
    this.setShowLoading.emit(true);
    this.cardBudgetsService
      .getCardBudgets(this.idCard, this.tab.id)
      .pipe(take(1))
      .subscribe(
        (data: CardBudgetsDTO[]) => {
          this.setShowLoading.emit(false);
          this.budgetsAndTemplatesData = data;
          this.dataLoaded = true;
        },
        (error: ConcenetError) => {
          this.setShowLoading.emit(false);
          this.logger.error(error);
          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
          this.budgetsAndTemplatesData = [];
          this.dataLoaded = true;
        }
      );
  }

  private getDataAndSetConfig(): void {
    this.idCard = parseInt(this.route?.snapshot?.params?.idCard, 10);
    this.cardInstanceBudgetsConfig = {
      tabId: this.tab.id,
      workflowId: this.cardInstance.workflowId,
      wcId: this.idCard,
      permission: this.tab.permissionType,
      disableBudgetsAdditionAction: this.tab.permissionType !== 'EDIT' ? true : false,
      disableIndividualDeleteAction: this.tab.permissionType !== 'EDIT' ? true : false
    };
    this.fetchData();
  }
}
