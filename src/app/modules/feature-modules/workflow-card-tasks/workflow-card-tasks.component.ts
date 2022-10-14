import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CardColumnTabDTO from '@data/models/cards/card-column-tab-dto';
import { CardTaskDTO } from '@data/models/cards/card-tasks-dto';
import { CardTasksService } from '@data/services/card-tasks.service';
import { TranslateService } from '@ngx-translate/core';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { NGXLogger } from 'ngx-logger';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-workflow-card-tasks',
  templateUrl: './workflow-card-tasks.component.html',
  styleUrls: ['./workflow-card-tasks.component.scss']
})
export class WorkflowCardTasksComponent implements OnInit, OnChanges {
  @Input() tab: CardColumnTabDTO = null;
  @Input() cardId: number = null;
  @Output() setShowLoading: EventEmitter<boolean> = new EventEmitter(false);
  public task: CardTaskDTO = null;

  constructor(
    private cardTasksService: CardTasksService,
    private translateService: TranslateService,
    private globalMessageService: GlobalMessageService,
    private spinnerService: ProgressSpinnerDialogService,
    private logger: NGXLogger
  ) {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && this.cardId) {
      this.getData();
    }
  }

  private getData(): void {
    let spinner: string = null;
    if (this.tab) {
      this.setShowLoading.emit(true);
    } else {
      spinner = this.spinnerService.show();
    }

    this.cardTasksService
      .getCardTasks(this.cardId, this.tab?.id)
      .pipe(take(1))
      .subscribe(
        (data: CardTaskDTO) => {
          if (this.tab) {
            this.setShowLoading.emit(false);
          } else {
            this.spinnerService.hide(spinner);
          }
          this.task = data;
        },
        (error: ConcenetError) => {
          if (this.tab) {
            this.setShowLoading.emit(false);
          } else {
            this.spinnerService.hide(spinner);
          }
          this.logger.error(error);
          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
        }
      );
  }
}
