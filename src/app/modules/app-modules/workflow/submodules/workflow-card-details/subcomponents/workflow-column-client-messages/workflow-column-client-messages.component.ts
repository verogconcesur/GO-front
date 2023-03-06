import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CardMessageDTO from '@data/models/cards/card-message';
import MessageChannelDTO from '@data/models/templates/message-channels-dto';
import { CardMessagesService } from '@data/services/card-messages.service';
import { TranslateService } from '@ngx-translate/core';
import { NotificationSoundService } from '@shared/services/notification-sounds.service';
import { take } from 'rxjs/operators';

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
  private interval: NodeJS.Timeout;
  private timeBeforeMarkAsRead = 15000;

  constructor(
    private cardMessageService: CardMessagesService,
    private route: ActivatedRoute,
    private translateService: TranslateService,
    private notificationSoundService: NotificationSoundService
  ) {}

  ngOnInit(): void {
    this.idCard = parseInt(this.route.snapshot.params.idCard, 10);
    this.getData();
    this.interval = setInterval(() => {
      // this.getData(true);
    }, this.timeBeforeMarkAsRead);
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
    this.interval = null;
  }

  public getData(fromInterval = false): void {
    if (this.idCard) {
      if (!fromInterval) {
        this.setShowLoading.emit(true);
      }
      const cardInstanceWorkflowId = this.idCard;
      this.cardMessageService
        .getCardMessages(cardInstanceWorkflowId)
        .pipe(take(1))
        .subscribe((res) => {
          if (res && fromInterval && this.messages.length !== res.length) {
            this.newCommentsEvent.emit(true);
            this.notificationSoundService.playSound('CLIENT_MESSAGES');
          } else if (fromInterval) {
            this.newCommentsEvent.emit(false);
          }
          this.messages = res;
          if (!fromInterval) {
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
}
