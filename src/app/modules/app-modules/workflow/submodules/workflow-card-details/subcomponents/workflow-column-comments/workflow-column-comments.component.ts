import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CardColumnTabDTO from '@data/models/cards/card-column-tab-dto';
import CardCommentDTO from '@data/models/cards/card-comment';
import UserDetailsDTO from '@data/models/user-permissions/user-details-dto';
import { CardCommentsService } from '@data/services/card-comments.service';
import { TranslateService } from '@ngx-translate/core';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { take } from 'rxjs/operators';
import { forkJoin, Observable } from 'rxjs';
// eslint-disable-next-line max-len
import { TextEditorWrapperConfigI } from '@modules/feature-modules/text-editor-wrapper/interfaces/text-editor-wrapper-config.interface';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { TextEditorWrapperComponent } from '@modules/feature-modules/text-editor-wrapper/text-editor-wrapper.component';

@Component({
  selector: 'app-workflow-column-comments',
  templateUrl: './workflow-column-comments.component.html',
  styleUrls: ['./workflow-column-comments.component.scss']
})
export class WorkflowColumnCommentsComponent implements OnInit {
  @ViewChild('textEditorWrapper') textEditorWrapper: TextEditorWrapperComponent;
  @Input() tab: CardColumnTabDTO = null;
  @Output() setShowLoading: EventEmitter<boolean> = new EventEmitter(false);
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
    airMode: false,
    height: 80
  };
  private readonly timeBeforeMarkAsRead = 10000;

  constructor(
    private cardCommentsService: CardCommentsService,
    private route: ActivatedRoute,
    private globalMessageService: GlobalMessageService,
    private translateService: TranslateService,
    private spinnerService: ProgressSpinnerDialogService
  ) {}

  ngOnInit(): void {
    this.getData(true);
  }

  public getData(usersToo?: boolean): void {
    //Cogemos el cardInstanceWorkflowId de la ruta
    if (this.route?.snapshot?.params?.id) {
      this.setShowLoading.emit(true);
      const cardInstanceWorkflowId = parseInt(this.route.snapshot.params.id, 10);
      const requests: Observable<CardCommentDTO[] | UserDetailsDTO[]>[] = [
        this.cardCommentsService.getCardComments(cardInstanceWorkflowId).pipe(take(1))
      ];
      if (usersToo) {
        requests.push(this.cardCommentsService.getCardUsersMention(cardInstanceWorkflowId).pipe(take(1)));
      }
      forkJoin(requests).subscribe(
        (data: [CardCommentDTO[], UserDetailsDTO[]]): void => {
          if (data[0]?.length) {
            this.comments = data[0];
          }
          if (data[1]?.length) {
            this.availableUsersToMention = data[1];
            this.availableUsersToMention.forEach((user: UserDetailsDTO) => {
              const fullName = this.getUserFullname(user, '.');
              this.availableMentions[fullName] = user;
            });
            this.textEditorConfig.hintAutomplete = Object.keys(this.availableMentions);
          }
          const anyCommentNew = this.comments.find((comment: CardCommentDTO) => comment.isNew) ? true : false;
          if (anyCommentNew) {
            this.setCommentsAsRead(cardInstanceWorkflowId);
          }
          // console.log(this.comments, this.availableUsersToMention, this.textEditorConfig);
          this.dataLoaded = true;
          this.setShowLoading.emit(false);
        },
        (errors: ConcenetError) => {
          this.setShowLoading.emit(false);
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
      }, 500);
    });
  }

  public setCommentsAsRead(cardInstanceWorkflowId: number): void {
    this.cardCommentsService.setCommentsAsRead(cardInstanceWorkflowId).subscribe((data) => {
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
      const cardInstanceWorkflowId = parseInt(this.route.snapshot.params.id, 10);
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
      const comment: CardCommentDTO = {
        comment: this.newComment,
        users: mentionedUsers.length ? mentionedUsers : null
      };
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
    let fullName = user.name;
    if (user.firstName) {
      fullName += `${separator}${user.firstName}`;
    }
    if (user.lastName) {
      fullName += `${separator}${user.lastName}`;
    }
    return fullName;
  }
}
