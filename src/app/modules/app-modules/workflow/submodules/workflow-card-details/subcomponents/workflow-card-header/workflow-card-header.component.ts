import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CardInstanceDTO from '@data/models/cards/card-instance-dto';
import { CardService } from '@data/services/cards.service';
import { TranslateService } from '@ngx-translate/core';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-workflow-card-header',
  templateUrl: './workflow-card-header.component.html',
  styleUrls: ['./workflow-card-header.component.scss']
})
export class WorkflowCardHeaderComponent implements OnInit {
  @Input() card: CardInstanceDTO = null;

  public labels = {
    follow: marker('common.follow'),
    following: marker('common.following')
  };

  constructor(
    private spinnerService: ProgressSpinnerDialogService,
    private route: ActivatedRoute,
    private cardsService: CardService,
    private globalMessageService: GlobalMessageService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {}

  public getColorsClass(): string {
    return `x-${this.card.colors.length}`;
  }

  public changeFollowingCard(): void {
    if (this.card && this.route?.snapshot?.params?.id) {
      const spinner = this.spinnerService.show();
      this.cardsService
        .followCard(!this.card.follower, this.route?.snapshot?.params?.id)
        .pipe(take(1))
        .subscribe(
          (data) => {
            this.card.follower = !this.card.follower;
            this.spinnerService.hide(spinner);
          },
          (error) => {
            this.spinnerService.hide(spinner);
            this.globalMessageService.showError({
              message: error.message,
              actionText: this.translateService.instant(marker('common.close'))
            });
          }
        );
    }
  }
}
