import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CardInstanceDTO from '@data/models/cards/card-instance-dto';
import { TranslateService } from '@ngx-translate/core';

export type MoveCardDialogConfig = {
  cardInstance: CardInstanceDTO;
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

  constructor(
    public dialogRef: MatDialogRef<MoveCardDialogComponent>,
    private translateService: TranslateService,
    @Inject(MAT_DIALOG_DATA) public config: MoveCardDialogConfig
  ) {}

  ngOnInit(): void {
    console.log('from MoveCardDialog', this.config);
  }

  public close(): void {
    this.dialogRef.close();
  }
}
