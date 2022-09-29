import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CardInstanceDTO from '@data/models/cards/card-instance-dto';
import WorkflowMoveDTO from '@data/models/workflows/workflow-move-dto';
import { CardService } from '@data/services/cards.service';
import { TranslateService } from '@ngx-translate/core';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { take } from 'rxjs/operators';

export type MoveCardDialogConfig = {
  cardInstance: CardInstanceDTO;
  idCard: number;
};

@Component({
  selector: 'app-move-card-dialog',
  templateUrl: './move-card-dialog.component.html',
  styleUrls: ['./move-card-dialog.component.scss']
})
export class MoveCardDialogComponent implements OnInit {
  public labels = {
    moveCard: marker('cards.moveCard'),
    moveWhere: marker('cards.moveWhere')
  };
  public cardInstance: CardInstanceDTO = null;
  public idCard: number = null;
  public allMovements: WorkflowMoveDTO[] = [];
  public sameWorkflowMovements: WorkflowMoveDTO[] = [];
  public otherWorkflowMovements: WorkflowMoveDTO[] = [];

  constructor(
    public dialogRef: MatDialogRef<MoveCardDialogComponent>,
    private cardService: CardService,
    private spinnerService: ProgressSpinnerDialogService,
    private globalMessageService: GlobalMessageService,
    private translateService: TranslateService,
    @Inject(MAT_DIALOG_DATA) public config: MoveCardDialogConfig
  ) {}

  ngOnInit(): void {
    this.cardInstance = this.config.cardInstance;
    this.idCard = this.config.idCard;
    this.getMovements();
  }

  public close(): void {
    this.dialogRef.close();
  }

  private getMovements(): void {
    const spinner = this.spinnerService.show();
    this.cardService
      .getCardInstanceMovements(this.idCard)
      .pipe(take(1))
      .subscribe(
        (movements: WorkflowMoveDTO[]) => {
          this.allMovements = movements;
          this.setTypeOfMovements();
          this.spinnerService.hide(spinner);
        },
        (error: ConcenetError) => {
          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
          this.spinnerService.hide(spinner);
        }
      );
  }

  private setTypeOfMovements(): void {
    this.sameWorkflowMovements = [];
    this.otherWorkflowMovements = [];
    console.log(this.allMovements, this.cardInstance, this.idCard);
    //DGDC TODO: me falta información a nivel de movimientos para saber a qué workflow pertenece
    if (this.allMovements?.length) {
      //Inicialmente pongo todos los movimientos como si de movimientos internos se tratase
      this.sameWorkflowMovements = [...this.allMovements];
    }
  }
}
