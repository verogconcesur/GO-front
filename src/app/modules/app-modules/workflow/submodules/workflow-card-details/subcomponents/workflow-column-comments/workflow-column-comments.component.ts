import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
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
import { forkJoin } from 'rxjs';
import { UserService } from '@data/services/user.service';
// eslint-disable-next-line max-len
import { TextEditorWrapperConfigI } from '@modules/feature-modules/text-editor-wrapper/interfaces/text-editor-wrapper-config.interface';

@Component({
  selector: 'app-workflow-column-comments',
  templateUrl: './workflow-column-comments.component.html',
  styleUrls: ['./workflow-column-comments.component.scss']
})
export class WorkflowColumnCommentsComponent implements OnInit, OnChanges {
  @Input() tab: CardColumnTabDTO = null;
  @Output() setShowLoading: EventEmitter<boolean> = new EventEmitter(false);
  public labels = { insertText: marker('common.insertTextHere') };
  public comments: CardCommentDTO[] = [];
  public availableUsersToMention: UserDetailsDTO[] = [];
  public availableMentions: string[] = [];
  public dataLoaded = false;
  public newComment = '';
  public textEditorConfig: TextEditorWrapperConfigI = {
    hideToolbar: true,
    hintAutomplete: [],
    disableResizeEditor: true,
    airMode: false,
    height: 80
  };

  constructor(
    private cardCommentsService: CardCommentsService,
    private route: ActivatedRoute,
    private globalMessageService: GlobalMessageService,
    private translateService: TranslateService,
    //DGDC TODO: Quitar user service
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.getData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.tab) {
      this.getData();
    }
  }

  public getData(): void {
    //Cogemos el cardInstanceWorkflowId de la ruta
    if (this.route?.snapshot?.params?.id) {
      this.setShowLoading.emit(true);
      const cardInstanceWorkflowId = parseInt(this.route.snapshot.params.id, 10);
      forkJoin([
        this.cardCommentsService.getCardComments(cardInstanceWorkflowId).pipe(take(1)),
        this.cardCommentsService.getCardUsersMention(cardInstanceWorkflowId).pipe(take(1))
      ]).subscribe(
        (data: [CardCommentDTO[], UserDetailsDTO[]]) => {
          if (data[0]?.length) {
            this.comments = data[0];
          }
          if (data[1]?.length) {
            this.availableUsersToMention = data[1];
            this.availableMentions = [...this.availableUsersToMention].map((user: UserDetailsDTO) => {
              let fullName = user.name;
              if (user.firstName) {
                fullName += `.${user.firstName}`;
              }
              if (user.lastName) {
                fullName += `.${user.lastName}`;
              }
              return fullName;
            });
            this.textEditorConfig.hintAutomplete = this.availableMentions;
          }
          console.log(this.comments, this.availableUsersToMention, this.textEditorConfig);
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
    console.log(comment);
    this.newComment = comment;
  }

  public sendComment() {
    console.log(this.newComment);
    this.newComment = '';
    this.dataLoaded = false;
    setTimeout(() => (this.dataLoaded = true));
  }
}
