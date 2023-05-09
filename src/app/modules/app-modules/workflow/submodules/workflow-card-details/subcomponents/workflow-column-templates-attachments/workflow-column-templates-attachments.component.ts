import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ActivatedRoute, ChildActivationEnd, NavigationEnd, Router } from '@angular/router';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { CardAttachmentsDTO } from '@data/models/cards/card-attachments-dto';
import CardColumnTabDTO from '@data/models/cards/card-column-tab-dto';
import { CardAttachmentsService } from '@data/services/card-attachments.service';
// eslint-disable-next-line max-len
import CardInstanceAttachmentsConfig from '@modules/feature-modules/card-instance-attachments/card-instance-attachments-config-interface';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { NGXLogger } from 'ngx-logger';
import { take } from 'rxjs/operators';
@UntilDestroy()
@Component({
  selector: 'app-workflow-column-templates-attachments',
  templateUrl: './workflow-column-templates-attachments.component.html',
  styleUrls: ['./workflow-column-templates-attachments.component.scss']
})
export class WorkflowColumnTemplatesAttachmentsComponent implements OnInit, OnChanges {
  @Input() tab: CardColumnTabDTO = null;
  @Output() setShowLoading: EventEmitter<boolean> = new EventEmitter(false);
  public labels = {
    noDataToShow: marker('errors.noDataToShow')
  };
  public idCard: number;
  public attachmentsAndTemplatesData: CardAttachmentsDTO[];
  public cardInstanceAttachmentsConfig: CardInstanceAttachmentsConfig;
  public dataLoaded = false;

  constructor(
    private cardAttachmentsService: CardAttachmentsService,
    private route: ActivatedRoute,
    private translateService: TranslateService,
    private globalMessageService: GlobalMessageService,
    private logger: NGXLogger,
    private router: Router
  ) {}

  ngOnInit(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.router.events.pipe(untilDestroyed(this)).subscribe((event: any) => {
      if (event instanceof NavigationEnd || event instanceof ChildActivationEnd) {
        if (this.router.url.indexOf('(cardSign') === -1) {
          this.fetchData();
        }
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.tab) {
      this.getDataAndSetConfig();
    }
  }

  public fetchData(): void {
    this.attachmentsAndTemplatesData = [];
    this.dataLoaded = false;
    this.setShowLoading.emit(true);
    this.cardAttachmentsService
      .getCardAttachments(this.idCard, this.tab.id)
      .pipe(take(1))
      .subscribe(
        (data: CardAttachmentsDTO[]) => {
          this.setShowLoading.emit(false);
          this.attachmentsAndTemplatesData = data;
          this.dataLoaded = true;
        },
        (error: ConcenetError) => {
          this.setShowLoading.emit(false);
          this.logger.error(error);
          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
          this.attachmentsAndTemplatesData = [];
          this.dataLoaded = true;
        }
      );
  }

  private getDataAndSetConfig(): void {
    this.idCard = parseInt(this.route?.snapshot?.params?.idCard, 10);
    this.cardInstanceAttachmentsConfig = {
      tabId: this.tab.id,
      wcId: this.idCard,
      permission: this.tab.permissionType,
      disableAttachmentsSelection: true,
      disableLandingAction: this.tab.permissionType !== 'EDIT' ? true : false,
      disableEditFileName: this.tab.permissionType !== 'EDIT' ? true : false,
      disableIndividualDeleteAction: this.tab.permissionType !== 'EDIT' ? true : false,
      disableAttachmentsAddition: this.tab.permissionType !== 'EDIT' ? true : false
    };
    this.fetchData();
  }
}
