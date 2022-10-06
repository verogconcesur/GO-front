import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { CardAttachmentsDTO } from '@data/models/cards/card-attachments-dto';
import CardColumnTabDTO from '@data/models/cards/card-column-tab-dto';
import { CardAttachmentsService } from '@data/services/card-attachments.service';
// eslint-disable-next-line max-len
import CardInstanceAttachmentsConfig from '@modules/feature-modules/card-instance-attachments/card-instance-attachments-config-interface';
import { TranslateService } from '@ngx-translate/core';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { NGXLogger } from 'ngx-logger';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-workflow-column-templates-attachments',
  templateUrl: './workflow-column-templates-attachments.component.html',
  styleUrls: ['./workflow-column-templates-attachments.component.scss']
})
export class WorkflowColumnTemplatesAttachmentsComponent implements OnInit, OnChanges {
  @Input() tab: CardColumnTabDTO = null;
  @Output() setShowLoading: EventEmitter<boolean> = new EventEmitter(false);
  public idCard: number;
  public attachmentsAndTemplatesData: CardAttachmentsDTO[];
  public cardInstanceAttachmentsConfig: CardInstanceAttachmentsConfig;

  constructor(
    private cardAttachmentsService: CardAttachmentsService,
    private route: ActivatedRoute,
    private translateService: TranslateService,
    private globalMessageService: GlobalMessageService,
    private logger: NGXLogger
  ) {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.tab) {
      this.getData();
    }
  }

  private getData(): void {
    this.setShowLoading.emit(true);
    this.idCard = parseInt(this.route?.snapshot?.params?.idCard, 10);
    this.cardInstanceAttachmentsConfig = {
      tabId: this.tab.id,
      wcId: this.idCard,
      disableAttachmentsSelection: true
    };
    this.cardAttachmentsService
      .getCardAttachments(this.idCard, this.tab.id)
      .pipe(take(1))
      .subscribe(
        (data: CardAttachmentsDTO[]) => {
          this.setShowLoading.emit(false);
          this.attachmentsAndTemplatesData = data;
        },
        (error: ConcenetError) => {
          this.setShowLoading.emit(false);
          this.logger.error(error);
          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
          console.log('TODO QUITAR: nos inventamos los datos');
          this.attachmentsAndTemplatesData = [
            {
              attachments: [
                {
                  content: 'string',
                  id: 2,
                  name: 'archivo.pdf',
                  size: 500,
                  thumbnail: '',
                  type: 'pdf'
                }
              ],
              permissionType: 'HIDE',
              templateAttachmentItem: {
                id: 2,
                name: 'Categoria 1',
                orderNumber: 0
              }
            },
            {
              attachments: [
                {
                  content: 'string',
                  id: 2,
                  name: 'archivo2.pdf',
                  size: 500,
                  thumbnail: '',
                  type: 'pdf'
                },
                {
                  content: 'string',
                  id: 2,
                  name: 'archivo3.pdf',
                  size: 500,
                  thumbnail: '',
                  type: 'pdf'
                },
                {
                  content: 'string',
                  id: 2,
                  name: 'archivo4.pdf',
                  size: 500,
                  thumbnail: '',
                  type: 'pdf'
                }
              ],
              permissionType: 'HIDE',
              templateAttachmentItem: {
                id: 3,
                name: 'Categoria 2',
                orderNumber: 1
              }
            }
          ];
        }
      );
  }
}
