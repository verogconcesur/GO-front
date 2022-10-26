import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ConcenetError } from '@app/types/error';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import CardColumnTabDTO from '@data/models/cards/card-column-tab-dto';
import CardDTO from '@data/models/cards/card-dto';
import CardInstanceDTO from '@data/models/cards/card-instance-dto';
import WorkflowCardTabItemDTO from '@data/models/workflows/workflow-card-tab-item-dto';
import WorkflowMoveDTO from '@data/models/workflows/workflow-move-dto';
import { CardService } from '@data/services/cards.service';
import { WorkflowPrepareAndMoveService } from '@modules/app-modules/workflow/aux-service/workflow-prepare-and-move-aux.service';
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
  @Input() card: CardDTO;
  public actions: WorkflowCardTabItemDTO[];
  public links: WorkflowCardTabItemDTO[];
  public shortCuts: WorkflowMoveDTO[];
  public idCard: number = null;
  public labels = {
    move: marker('common.move'),
    send: marker('common.send'),
    externalLinks: marker('common.externalLinks'),
    directLinks: marker('common.directLinks')
  };

  constructor(
    private cardService: CardService,
    private route: ActivatedRoute,
    private globalMessageService: GlobalMessageService,
    private translateService: TranslateService,
    private dialog: MatDialog,
    private prepareAndMoveService: WorkflowPrepareAndMoveService
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
      this.cardService
        .getCardInstanceMovements(this.idCard, 'SHORTCUT')
        .pipe(take(1))
        .subscribe(
          (data: WorkflowMoveDTO[]) => {
            this.shortCuts = data;
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

  public btnClickShortcut(move: WorkflowMoveDTO): void {
    this.prepareAndMoveService.prepareAndMove(
      {
        cardId: null,
        customerId: null,
        id: null,
        repairOrderId: null,
        tabItems: [],
        vehicleId: null,
        colors: [],
        movements: [],
        cardInstanceWorkflows: [this.cardInstance.cardInstanceWorkflow]
      },
      move,
      null,
      null,
      '',
      null
    );
  }

  public moveCard(): void {
    this.dialog.open(MoveCardDialogComponent, {
      data: { cardInstance: this.cardInstance, idCard: this.idCard, card: this.card, view: 'MOVES_IN_THIS_WORKFLOW' }
    });
  }

  public sendCardToOtherWorkflow(): void {
    this.dialog.open(MoveCardDialogComponent, {
      data: { cardInstance: this.cardInstance, idCard: this.idCard, card: this.card, view: 'MOVES_IN_OTHER_WORKFLOWS' }
    });
  }

  public getBgColor(btn: WorkflowCardTabItemDTO, color?: string): string {
    if (btn?.typeItem === 'LINK' && btn.tabItemConfigLink.color) {
      return btn.tabItemConfigLink.color;
    } else if (color) {
      return color;
    }
    return '#fff';
  }

  public getFontColor(btn: WorkflowCardTabItemDTO, btnColor?: string): string {
    const lightColor = '#fff';
    const darkColor = '#000';
    if (btn?.typeItem === 'LINK' && btn.tabItemConfigLink.color) {
      const bgColor = btn.tabItemConfigLink.color;
      const color = bgColor.charAt(0) === '#' ? bgColor.substring(1, 7) : bgColor;
      const r = parseInt(color.substring(0, 2), 16); // hexToR
      const g = parseInt(color.substring(2, 4), 16); // hexToG
      const b = parseInt(color.substring(4, 6), 16); // hexToB
      return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? darkColor : lightColor;
    } else if (btnColor) {
      const bgColor = btnColor;
      const color = bgColor.charAt(0) === '#' ? bgColor.substring(1, 7) : bgColor;
      const r = parseInt(color.substring(0, 2), 16); // hexToR
      const g = parseInt(color.substring(2, 4), 16); // hexToG
      const b = parseInt(color.substring(4, 6), 16); // hexToB
      return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? darkColor : lightColor;
    }
    return darkColor;
  }
}
