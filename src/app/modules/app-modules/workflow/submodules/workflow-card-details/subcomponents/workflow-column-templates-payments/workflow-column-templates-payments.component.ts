import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { CardPaymentsDTO } from '@data/models/cards/card-payments-dto';
import CardColumnTabDTO from '@data/models/cards/card-column-tab-dto';
import { CardPaymentsService } from '@data/services/card-payments.service';
import CardInstancePaymentsConfig from '@modules/feature-modules/card-instance-payments/card-instance-payments-config-interface';
import { TranslateService } from '@ngx-translate/core';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { take } from 'rxjs/operators';
import { NGXLogger } from 'ngx-logger';
import CardInstanceDTO from '@data/models/cards/card-instance-dto';

@Component({
  selector: 'app-workflow-column-templates-payments',
  templateUrl: './workflow-column-templates-payments.component.html',
  styleUrls: ['./workflow-column-templates-payments.component.scss']
})
export class WorkflowColumnTemplatesPaymentsComponent implements OnInit, OnChanges {
  @Input() tab: CardColumnTabDTO = null;
  @Input() cardInstance: CardInstanceDTO;
  @Output() setShowLoading: EventEmitter<boolean> = new EventEmitter(false);
  public labels = {
    noDataToShow: marker('errors.noDataToShow')
  };
  public idCard: number;
  public paymentsData: CardPaymentsDTO;
  public cardInstancePaymentsConfig: CardInstancePaymentsConfig;
  public dataLoaded = false;

  constructor(
    private cardPaymentsService: CardPaymentsService,
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
    this.paymentsData = null;
    this.dataLoaded = false;
    this.setShowLoading.emit(true);
    this.cardPaymentsService
      .getCardPayments(this.idCard, this.tab.id)
      .pipe(take(1))
      .subscribe(
        (data: CardPaymentsDTO) => {
          this.setShowLoading.emit(false);
          this.paymentsData = data;
          this.dataLoaded = true;
        },
        (error: ConcenetError) => {
          this.setShowLoading.emit(false);
          this.logger.error(error);
          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
          this.paymentsData = null;
          this.dataLoaded = true;
        }
      );
  }

  private getDataAndSetConfig(): void {
    this.idCard = parseInt(this.route?.snapshot?.params?.idCard, 10);
    this.cardInstancePaymentsConfig = {
      tabId: this.tab.id,
      workflowId: this.cardInstance.workflowId,
      wcId: this.idCard,
      permission: this.tab.permissionType,
      disablePaymentsAdditionAction: this.tab.permissionType !== 'EDIT' ? true : false,
      disableIndividualDeleteAction: this.tab.permissionType !== 'EDIT' ? true : false
    };
    this.fetchData();
  }
}
