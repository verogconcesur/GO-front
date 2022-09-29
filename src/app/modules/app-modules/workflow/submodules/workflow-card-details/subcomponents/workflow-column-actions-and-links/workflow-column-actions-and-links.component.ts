import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CardColumnTabDTO from '@data/models/cards/card-column-tab-dto';
import CardInstanceDTO from '@data/models/cards/card-instance-dto';
import WorkflowCardTabItemDTO from '@data/models/workflows/workflow-card-tab-item-dto';
import { CardService } from '@data/services/cards.service';
import { TranslateService } from '@ngx-translate/core';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { take } from 'rxjs/operators';
import { MoveCardDialogComponent } from '../move-card-dialog/move-card-dialog.component';

@Component({
  selector: 'app-workflow-column-actions-and-links',
  templateUrl: './workflow-column-actions-and-links.component.html',
  styleUrls: ['./workflow-column-actions-and-links.component.scss']
})
export class WorkflowColumnActionsAndLinksComponent implements OnInit {
  @Input() tab: CardColumnTabDTO = null;
  @Input() cardInstance: CardInstanceDTO;
  public actions: WorkflowCardTabItemDTO[];
  public links: WorkflowCardTabItemDTO[];
  public idCard: number = null;
  public labels = {
    move: marker('common.move'),
    directLinks: marker('common.directLinks')
  };

  constructor(
    private cardService: CardService,
    private route: ActivatedRoute,
    private globalMessageService: GlobalMessageService,
    private translateService: TranslateService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.idCard = parseInt(this.route?.snapshot?.params?.idCard, 10);
    this.getData();
  }

  public getData(): void {
    //Cogemos el cardInstanceWorkflowId de la ruta
    if (this.idCard) {
      this.cardService
        .getCardTabData(this.idCard, this.tab.id)
        .pipe(take(1))
        .subscribe(
          (data: WorkflowCardTabItemDTO[]) => {
            this.actions = data.filter((item: WorkflowCardTabItemDTO) => item.typeItem === 'ACTION');
            this.links = data.filter((item: WorkflowCardTabItemDTO) => item.typeItem === 'LINK');
          },
          (error: ConcenetError) => {
            this.globalMessageService.showError({
              message: error.message,
              actionText: this.translateService.instant(marker('common.close'))
            });
          }
        );
    }
  }

  public btnClick(btn: WorkflowCardTabItemDTO): void {
    if (btn.typeItem === 'LINK') {
      let link = btn.tabItemConfigLink.link;
      if (btn.tabItemConfigLink.link.indexOf('http') === -1) {
        link = 'http://' + btn.tabItemConfigLink.link;
      }
      window.open(link, '_blank');
    } else if (btn.typeItem === 'ACTION') {
      switch (btn.tabItemConfigAction.actionType) {
        case 'ATTACH_DOC':
          console.log('ATTACH_DOC');
          break;
        case 'SIGN_DOC':
          console.log('SIGN_DOC');
          break;
        case 'MESSAGE_CLIENT':
          console.log('MESSAGE_CLIENT');
          break;
      }
    }
  }

  public moveCard(): void {
    this.dialog.open(MoveCardDialogComponent, { data: { cardInstance: this.cardInstance, idCard: this.idCard } });
  }

  public getBgColor(btn: WorkflowCardTabItemDTO): string {
    if (btn.typeItem === 'LINK' && btn.tabItemConfigLink.color) {
      return btn.tabItemConfigLink.color;
    }
    return '#fff';
  }

  public getFontColor(btn: WorkflowCardTabItemDTO): string {
    const lightColor = '#fff';
    const darkColor = '#000';
    if (btn.typeItem === 'LINK' && btn.tabItemConfigLink.color) {
      const bgColor = btn.tabItemConfigLink.color;
      const color = bgColor.charAt(0) === '#' ? bgColor.substring(1, 7) : bgColor;
      const r = parseInt(color.substring(0, 2), 16); // hexToR
      const g = parseInt(color.substring(2, 4), 16); // hexToG
      const b = parseInt(color.substring(4, 6), 16); // hexToB
      return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? darkColor : lightColor;
    }
    return darkColor;
  }
}
