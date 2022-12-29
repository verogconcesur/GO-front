import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CardColumnTabDTO from '@data/models/cards/card-column-tab-dto';
import CardMessageDTO from '@data/models/cards/card-message';
import MessageChannelDTO from '@data/models/templates/message-channels-dto';
import UserDetailsDTO from '@data/models/user-permissions/user-details-dto';
import { CardMessagesService } from '@data/services/card-messages.service';
import { TranslateService } from '@ngx-translate/core';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { forkJoin, Observable } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-workflow-column-client-messages',
  templateUrl: './workflow-column-client-messages.component.html',
  styleUrls: ['./workflow-column-client-messages.component.scss']
})
export class WorkflowColumnClientMessagesComponent implements OnInit {
  @Output() setShowLoading: EventEmitter<boolean> = new EventEmitter(false);
  public messages: CardMessageDTO[] = [];
  public labels = { customer: marker('common.customer') };
  public dataLoaded = false;

  constructor(
    private cardMessageService: CardMessagesService,
    private route: ActivatedRoute,
    private globalMessageService: GlobalMessageService,
    private translateService: TranslateService,
    private spinnerService: ProgressSpinnerDialogService
  ) {}

  ngOnInit(): void {
    this.getData();
  }

  public getData(): void {
    if (this.route?.snapshot?.params?.idCard) {
      this.setShowLoading.emit(true);
      const cardInstanceWorkflowId = parseInt(this.route.snapshot.params.idCard, 10);
      this.cardMessageService
        .getCardMessages(cardInstanceWorkflowId)
        .pipe(take(1))
        .subscribe((res) => {
          this.messages = res;
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
