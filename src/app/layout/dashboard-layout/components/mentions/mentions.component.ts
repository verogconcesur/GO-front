import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import MentionDataListDTO from '@data/models/notifications/mention-data-list-dto';
import { NotificationService } from '@data/services/notifications.service';
import { finalize, take } from 'rxjs/operators';

@Component({
  selector: 'app-mentions',
  templateUrl: './mentions.component.html',
  styleUrls: ['./mentions.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MentionsComponent implements OnInit {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public labels: any = {
    newMentions: marker('common.unread'),
    oldMentions: marker('common.readen'),
    noDataToShow: marker('errors.noDataToShow')
  };
  public mentions: MentionDataListDTO[] = [];
  public loading = false;
  private originalMentions: MentionDataListDTO[] = [];
  constructor(private mentionService: NotificationService) {}

  ngOnInit(): void {}

  public getData(): void {
    this.loading = true;
    this.mentions = [];
    this.mentionService
      .getMentions('NO_READ')
      // .getMentions('ALL')
      .pipe(
        take(1),
        finalize(() => (this.loading = false))
      )
      .subscribe((data) => {
        this.originalMentions = data;
        this.filterDataToShow();
      });
  }

  public markAsViewed(item: MentionDataListDTO): void {
    this.loading = true;
    this.mentionService
      .markMentionAsRead(item.cardInstanceCommentId)
      .pipe(
        take(1),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe((data) => {
        this.getData();
      });
  }

  public filterDataToShow(): void {
    this.mentions = [...this.originalMentions];
  }
}
