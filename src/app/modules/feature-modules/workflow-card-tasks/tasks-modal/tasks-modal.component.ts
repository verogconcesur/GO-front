import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { CardTaskDTO } from '@data/models/cards/card-tasks-dto';
import { CardTasksService } from '@data/services/card-tasks.service';
import { TranslateService } from '@ngx-translate/core';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { NGXLogger } from 'ngx-logger';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-tasks-modal',
  templateUrl: './tasks-modal.component.html',
  styleUrls: ['./tasks-modal.component.scss']
})
export class TasksModalComponent implements OnInit {
  public cardId: number = null;
  public task: CardTaskDTO = null;
  public labels = {
    noData: marker('errors.noDataToShow')
  };

  constructor(
    private dialogRef: MatDialogRef<TasksModalComponent>,
    private cardTasksService: CardTasksService,
    private translateService: TranslateService,
    private globalMessageService: GlobalMessageService,
    private spinnerService: ProgressSpinnerDialogService,
    private logger: NGXLogger,
    @Inject(MAT_DIALOG_DATA) public dialogData: { cardId: number }
  ) {}

  ngOnInit(): void {
    if (this.dialogData?.cardId) {
      this.cardId = this.dialogData.cardId;
      this.getData();
    }
  }

  public close(): void {
    this.dialogRef.close();
  }

  private getData(): void {
    const spinner = this.spinnerService.show();

    this.cardTasksService
      .getCardTasks(this.cardId, null)
      .pipe(take(1))
      .subscribe(
        (data: CardTaskDTO) => {
          this.spinnerService.hide(spinner);
          this.task = data;
        },
        (error: ConcenetError) => {
          this.spinnerService.hide(spinner);
          this.logger.error(error);
          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
        }
      );
  }
}
