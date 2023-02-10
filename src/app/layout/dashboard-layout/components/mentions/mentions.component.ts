import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import { AuthenticationService } from '@app/security/authentication.service';
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
    oldMentions: marker('common.readen')
  };
  public mentions: {
    new: MentionDataListDTO[];
    old: MentionDataListDTO[];
  } = {
    new: [],
    old: []
  };
  public loading = false;
  private originalMentions: MentionDataListDTO[] = [];
  constructor(private authService: AuthenticationService, private mentionService: NotificationService, private router: Router) {}

  ngOnInit(): void {}

  public getData(): void {
    this.loading = true;
    this.mentionService
      .getMentions()
      .pipe(
        take(1),
        finalize(() => (this.loading = false))
      )
      .subscribe((data) => {
        this.originalMentions = data;
        this.filterDataToShow();
      });
  }

  public goToCard(item: MentionDataListDTO): void {
    let url = `${RouteConstants.DASHBOARD}/${RouteConstants.WORKFLOWS}/${item.workflowId}/`;
    if (this.router.url.indexOf(RouteConstants.WORKFLOWS_CALENDAR_VIEW) >= 0) {
      url += `${RouteConstants.WORKFLOWS_CALENDAR_VIEW}`;
    } else if (this.router.url.indexOf(RouteConstants.WORKFLOWS_TABLE_VIEW) >= 0) {
      url += `${RouteConstants.WORKFLOWS_TABLE_VIEW}`;
    } else {
      url += `${RouteConstants.WORKFLOWS_BOARD_VIEW}`;
    }
    url += `/(${RouteConstants.WORKFLOWS_CARD}:${RouteConstants.WORKFLOWS_ID_CARD}/${item.cardInstanceWorkflowId}/${
      RouteConstants.WORKFLOWS_ID_USER
    }/${item.workflowSubstateFront && item.userAsignId ? item.userAsignId : 'null'})`;
    this.router.navigateByUrl(url);
  }

  public filterDataToShow(): void {
    const filtered = [...this.originalMentions];
    this.mentions.new = filtered.filter((d) => !d.read);
    this.mentions.old = filtered.filter((d) => d.read);
  }
}
