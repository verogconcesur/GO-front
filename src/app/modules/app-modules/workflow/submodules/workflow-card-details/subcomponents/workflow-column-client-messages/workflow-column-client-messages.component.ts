import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RxStompService } from '@app/services/rx-stomp.service';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CardMessageDTO from '@data/models/cards/card-message';
import MessageChannelDTO from '@data/models/templates/message-channels-dto';
import WorkflowSocketCardDetailDTO from '@data/models/workflows/workflow-sockect-card-detail-dto';
import { CardMessagesService } from '@data/services/card-messages.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import { NotificationSoundService } from '@shared/services/notification-sounds.service';
import { skip, take } from 'rxjs/operators';

@UntilDestroy()
@Component({
  selector: 'app-workflow-column-client-messages',
  templateUrl: './workflow-column-client-messages.component.html',
  styleUrls: ['./workflow-column-client-messages.component.scss']
})
export class WorkflowColumnClientMessagesComponent implements OnInit, OnDestroy {
  @Output() setShowLoading: EventEmitter<boolean> = new EventEmitter(false);
  @Output() newCommentsEvent: EventEmitter<boolean> = new EventEmitter(false);
  public messages: CardMessageDTO[] = [];
  public labels = { customer: marker('common.customer') };
  public dataLoaded = false;
  private idCard: number;
  private timeBeforeMarkAsRead = 15000;

  constructor(
    private cardMessageService: CardMessagesService,
    private route: ActivatedRoute,
    private translateService: TranslateService,
    private notificationSoundService: NotificationSoundService,
    private rxStompService: RxStompService
  ) {}

  ngOnInit(): void {
    this.idCard = parseInt(this.route.snapshot.params.idCard, 10);
    this.getData();
    this.rxStompService.cardDeatilWs$.pipe(untilDestroyed(this), skip(1)).subscribe((data: WorkflowSocketCardDetailDTO) => {
      if (data && data.cardInstanceWorkflowId === this.idCard && data.message === 'DETAIL_MESSAGES') {
        this.getData(true);
      }
    });
  }

  ngOnDestroy(): void {}

  public getData(fromSockets = false): void {
    if (this.idCard) {
      if (!fromSockets) {
        this.setShowLoading.emit(true);
      }
      const cardInstanceWorkflowId = this.idCard;
      this.cardMessageService
        .getCardMessages(cardInstanceWorkflowId)
        .pipe(take(1))
        .subscribe((res) => {
          if (res && fromSockets && this.messages?.length !== res.length) {
            this.newCommentsEvent.emit(true);
            this.notificationSoundService.playSound('CLIENT_MESSAGES');
          } else if (fromSockets) {
            this.newCommentsEvent.emit(false);
          }
          this.messages = res;
          if (!fromSockets) {
            this.setShowLoading.emit(false);
          }
        });
    }
  }

  public getUserFullname(message: CardMessageDTO, separator = ' '): string {
    let fullName = message.fullNameSender;
    if (message.sender === 'CUSTOMER') {
      fullName += `${separator}(${this.translateService.instant(this.labels.customer)})`;
    } else {
      fullName += `${separator}(${message.roleSender})`;
    }
    return fullName;
  }
  public checkMessageChannel(message: CardMessageDTO, channelId: number): boolean {
    return message.messageChannels && !!message.messageChannels.find((msg: MessageChannelDTO) => msg.id === channelId);
  }
  public checkMessageSignature(message: CardMessageDTO): boolean {
    return message.cardInstanceRemoteSignature ? true : false;
  }
}
