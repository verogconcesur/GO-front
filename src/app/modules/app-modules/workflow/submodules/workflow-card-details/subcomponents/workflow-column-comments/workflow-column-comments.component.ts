import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CardColumnTabDTO from '@data/models/cards/card-column-tab-dto';
import CardCommentDTO from '@data/models/cards/card-comment';
import UserDetailsDTO from '@data/models/user-permissions/user-details-dto';
import { CardCommentsService } from '@data/services/card-comments.service';
import { TranslateService } from '@ngx-translate/core';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { skip, take } from 'rxjs/operators';
import { forkJoin, Observable } from 'rxjs';
// eslint-disable-next-line max-len
import { TextEditorWrapperConfigI } from '@modules/feature-modules/text-editor-wrapper/interfaces/text-editor-wrapper-config.interface';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { TextEditorWrapperComponent } from '@modules/feature-modules/text-editor-wrapper/text-editor-wrapper.component';
import { NotificationSoundService } from '@shared/services/notification-sounds.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { RxStompService } from '@app/services/rx-stomp.service';
import { IMessage } from '@stomp/stompjs';
import WorkflowSocketCardDetailDTO from '@data/models/workflows/workflow-sockect-card-detail-dto';
import { AuthenticationService } from '@app/security/authentication.service';

@UntilDestroy()
@Component({
  selector: 'app-workflow-column-comments',
  templateUrl: './workflow-column-comments.component.html',
  styleUrls: ['./workflow-column-comments.component.scss']
})
export class WorkflowColumnCommentsComponent implements OnInit, OnDestroy {
  @ViewChild('textEditorWrapper') textEditorWrapper: TextEditorWrapperComponent;
  @Input() tab: CardColumnTabDTO = null;
  @Output() setShowLoading: EventEmitter<boolean> = new EventEmitter(false);
  @Output() newCommentsEvent: EventEmitter<boolean> = new EventEmitter(false);
  public labels = { insertText: marker('common.insertTextHere') };
  public comments: CardCommentDTO[] = [];
  public commentSelected: CardCommentDTO = null;
  public availableUsersToMention: UserDetailsDTO[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public availableMentions: any = {};
  public dataLoaded = false;
  public newComment = '';
  public textEditorConfig: TextEditorWrapperConfigI = {
    hideToolbar: true,
    hintAutomplete: [],
    disableResizeEditor: true,
    disableDragAndDrop: true,
    airMode: false,
    height: 80
  };
  private readonly timeBeforeMarkAsRead = 20000;
  private sendingComment = false;
  private idCard: number;

  constructor(
    private cardCommentsService: CardCommentsService,
    private route: ActivatedRoute,
    private globalMessageService: GlobalMessageService,
    private translateService: TranslateService,
    private spinnerService: ProgressSpinnerDialogService,
    private notificationSoundService: NotificationSoundService,
    private rxStompService: RxStompService,
    private authService: AuthenticationService
  ) {}

  ngOnInit(): void {
    this.idCard = parseInt(this.route.snapshot.params.idCard, 10);
    this.getData(true);
    this.rxStompService.cardDeatilWs$.pipe(untilDestroyed(this), skip(1)).subscribe((data: WorkflowSocketCardDetailDTO) => {
      if (
        !this.sendingComment &&
        data &&
        data.cardInstanceWorkflowId === this.idCard &&
        data.userId.toString() !== this.authService.getUserId() &&
        data.message === 'DETAIL_COMMENTS'
      ) {
        this.getData(false, false, true);
      } else if (this.sendingComment) {
        this.sendingComment = false;
      }
    });
  }

  ngOnDestroy(): void {}

  public getData(usersToo = false, showLoading = true, fromSockets = false): void {
    //Cogemos el cardInstanceWorkflowId de la ruta
    if (this.idCard) {
      if (showLoading) {
        this.setShowLoading.emit(true);
      }
      const cardInstanceWorkflowId = this.idCard;
      const requests: Observable<CardCommentDTO[] | UserDetailsDTO[]>[] = [
        this.cardCommentsService.getCardComments(cardInstanceWorkflowId).pipe(take(1))
      ];
      if (usersToo) {
        requests.push(this.cardCommentsService.getCardUsersMention(cardInstanceWorkflowId).pipe(take(1)));
      }
      forkJoin(requests).subscribe(
        (data: [CardCommentDTO[], UserDetailsDTO[]]): void => {
          if (data[0]?.length) {
            if (fromSockets && this.comments.length !== data[0].length) {
              this.newCommentsEvent.emit(true);
              this.notificationSoundService.playSound('COMMENTS');
            } else if (fromSockets) {
              this.newCommentsEvent.emit(false);
            }
            this.comments = data[0];
            if (fromSockets && this.commentSelected) {
              this.commentSelected = data[0].find((comment) => this.commentSelected.id === comment.id);
            }
          }
          if (data[1]?.length) {
            this.availableUsersToMention = data[1];
            this.availableUsersToMention.forEach((user: UserDetailsDTO) => {
              const fullName = this.getUserFullname(user, '_');
              this.availableMentions[fullName] = user;
            });
            this.textEditorConfig.hintAutomplete = Object.keys(this.availableMentions);
          }
          const newComments = this.comments.filter((comment: CardCommentDTO) => comment.isNew);
          setTimeout(() => {
            this.newCommentsEvent.emit(false);
          }, this.timeBeforeMarkAsRead);
          if (newComments?.length) {
            this.setCommentsAsRead(newComments.map((comment: CardCommentDTO) => comment.id));
          }
          // console.log(this.comments, this.availableUsersToMention, this.textEditorConfig);
          this.dataLoaded = true;
          if (showLoading) {
            this.setShowLoading.emit(false);
          }
        },
        (errors: ConcenetError) => {
          if (showLoading) {
            this.setShowLoading.emit(false);
          }
          this.globalMessageService.showError({
            message: errors.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
        }
      );
    }
  }

  public newCommentChange(comment: string): void {
    this.newComment = comment;
  }

  public selectComment(comment: CardCommentDTO): void {
    if (this.commentSelected === comment) {
      this.commentSelected = null;
    } else {
      this.commentSelected = comment;
    }
  }

  public answerComment(comment: CardCommentDTO): void {
    this.newComment =
      '<p><span><b contenteditable="false" readonly="readonly"> @' + this.getUserFullname(comment.user, '.') + ' </b></span></p>';
    this.dataLoaded = false;
    setTimeout(() => {
      this.dataLoaded = true;
      setTimeout(() => {
        this.textEditorWrapper.placeCursorAtEnd();
      }, 100);
    });
  }

  public setCommentsAsRead(commentIds: number[]): void {
    const requests: Observable<unknown>[] = [];
    commentIds.forEach((id) => {
      requests.push(this.cardCommentsService.setCommentsAsRead(id));
    });
    forkJoin(requests).subscribe((data) => {
      setTimeout(() => {
        this.comments.map((comment: CardCommentDTO) => {
          comment.isNew = false;
          return comment;
        });
      }, this.timeBeforeMarkAsRead);
    });
  }

  public sendComment() {
    if (this.newComment && this.newComment !== '<br>' && this.newComment !== '<p></p>') {
      const spinner = this.spinnerService.show();
      const cardInstanceWorkflowId = this.idCard;
      const mentionedUsers: { mention: boolean; user: { id: number } }[] = [];
      Object.keys(this.availableMentions).forEach((fullName: string) => {
        if (this.newComment.indexOf('@' + fullName) >= 0) {
          mentionedUsers.push({
            mention: true,
            user: {
              id: this.availableMentions[fullName].id
            }
          });
        }
      });
      // this.socketService.emitEvent('/app/send/message', this.newComment);
      const comment: CardCommentDTO = {
        comment: this.newComment,
        users: mentionedUsers.length ? mentionedUsers : null
      };
      this.sendingComment = true;
      this.cardCommentsService.addCardComment(cardInstanceWorkflowId, comment).subscribe(
        (data: CardCommentDTO) => {
          this.spinnerService.hide(spinner);
          this.newComment = '';
          this.dataLoaded = false;
          setTimeout(() => (this.dataLoaded = true));
          this.getData();
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

  public getUserFullname(user: UserDetailsDTO, separator = ' '): string {
    let fullName = user.name.split(' ').join('');
    if (user.firstName) {
      fullName += `${separator}${user.firstName.split(' ').join('')}`;
    }
    if (user.lastName) {
      fullName += `${separator}${user.lastName.split(' ').join('')}`;
    }
    return fullName;
  }
}
