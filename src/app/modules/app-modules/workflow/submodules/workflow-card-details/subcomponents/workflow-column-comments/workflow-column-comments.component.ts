import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
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

@Component({
  selector: 'app-workflow-column-comments',
  templateUrl: './workflow-column-comments.component.html',
  styleUrls: ['./workflow-column-comments.component.scss']
})
export class WorkflowColumnCommentsComponent implements OnInit, OnChanges {
  @Input() tab: CardColumnTabDTO = null;
  @Output() setShowLoading: EventEmitter<boolean> = new EventEmitter(false);

  constructor(
    private cardCommentsService: CardCommentsService,
    private route: ActivatedRoute,
    private globalMessageService: GlobalMessageService,
    private translateService: TranslateService
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
          console.log(data);
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
}
