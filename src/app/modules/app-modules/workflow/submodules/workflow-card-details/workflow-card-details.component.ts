/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, HostListener, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import WorkflowCardDTO from '@data/models/workflows/workflow-card-dto';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { CardService } from '@data/services/cards.service';
import { take } from 'rxjs/operators';
import CardColumnDTO from '@data/models/cards/card-column-dto';
import { ProgressSpinnerDialogService } from '@shared/services/progress-spinner-dialog.service';
import { GlobalMessageService } from '@shared/services/global-message.service';
import { ConcenetError } from '@app/types/error';
import { TranslateService } from '@ngx-translate/core';
import CardInstanceDTO from '@data/models/cards/card-instance-dto';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { WorkflowPrepareAndMoveService } from '../../aux-service/workflow-prepare-and-move-aux.service';

@UntilDestroy()
@Component({
  selector: 'app-workflow-card-details',
  templateUrl: './workflow-card-details.component.html',
  styleUrls: ['./workflow-card-details.component.scss']
})
export class WorkflowCardDetailsComponent implements OnInit {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public relativeTo: any = null;
  public card: WorkflowCardDTO = null;
  public idCard: number = null;
  public idUser: number = null;
  public tabSelected: 'column1' | 'column2' | 'messages' | 'actions' = 'column1';
  public showMode: 'all' | 'semi' | 'individual' = 'all';
  public labels = {
    column1: '',
    column2: '',
    messages: marker('common.messages'),
    actions: marker('common.actions')
  };
  public columnsConfig: CardColumnDTO[] = null;
  public cardInstance: CardInstanceDTO = null;
  public newDataInCommentsOrMessages = {
    COMMENTS: false,
    CLIENT_MESSAGES: false
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private cardService: CardService,
    private spinnerService: ProgressSpinnerDialogService,
    private globalMessageService: GlobalMessageService,
    private translateService: TranslateService,
    private prepareAndMoveService: WorkflowPrepareAndMoveService
  ) {}

  @HostListener('window:resize', ['$event']) onResize(event: { target: { innerWidth: number } }) {
    this.setShowMode(event.target.innerWidth);
  }

  ngOnInit(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const state: any = this.location.getState();
    if (state.relativeTo) {
      this.relativeTo = JSON.parse(state.relativeTo);
    }
    if (state.card) {
      this.card = JSON.parse(state.card);
      this.idCard = this.card.cardInstanceWorkflows[0].id;
    } else if (this.route?.snapshot?.params?.idCard) {
      this.idCard = parseInt(this.route?.snapshot?.params?.idCard, 10);
    }
    if (this.route?.snapshot?.params?.idUser && this.route?.snapshot?.params?.idUser !== 'null') {
      this.idUser = parseInt(this.route?.snapshot?.params?.idUser, 10);
    }
    this.setShowMode(window.innerWidth);
    this.initListeners();
    this.getCardInfo();
  }

  public setShowMode(width: number) {
    let showMode: 'all' | 'semi' | 'individual' = 'all';
    if (width <= 1400 && width > 1150) {
      showMode = 'semi';
    } else if (width <= 1150) {
      showMode = 'individual';
    }
    this.showMode = showMode;
  }

  public initListeners(): void {
    this.prepareAndMoveService.reloadData$.pipe(untilDestroyed(this)).subscribe((resp) => {
      if (resp === 'MOVES_IN_THIS_WORKFLOW') {
        //Si el movimiento ha sido en este workflow cierro el detalle de tarjeta
        this.close();
      } else if (resp === 'MOVES_IN_OTHER_WORKFLOWS') {
        //Si el movimiento ha sido a otro workflow recargo todo.
        // window.location.reload();
        this.card = null;
        this.cardInstance = null;
        this.columnsConfig = null;
        this.getCardInfo();
      }
    });
  }

  public newComments(data: { newData: boolean; column: 'COMMENTS' | 'CLIENT_MESSAGES' }): void {
    this.newDataInCommentsOrMessages[data.column] = data.newData;
  }

  public close(): void {
    if (this.relativeTo) {
      this.router.navigate([{ outlets: { card: null } }], {
        relativeTo: this.relativeTo
      });
    } else {
      const currentUrl = window.location.hash.split('#/').join('/').split('/(card:')[0];
      this.router.navigateByUrl(currentUrl);
    }
  }

  public isTabSelected(tab: 'column1' | 'column2' | 'messages' | 'actions'): boolean {
    return this.tabSelected === tab;
  }

  public changeSelectedTab(tab: 'column1' | 'column2' | 'messages' | 'actions'): void {
    this.tabSelected = tab;
  }

  public getContainerClass(): string {
    return this.showMode + ' ' + this.tabSelected;
  }

  private getCardInfo(): void {
    const spinner = this.spinnerService.show();
    this.cardService
      .getCardInstanceDetailById(this.idCard, this.idUser)
      .pipe(take(1))
      .subscribe(
        (data: CardInstanceDTO) => {
          this.spinnerService.hide(spinner);
          this.cardInstance = data;
          this.columnsConfig = data.card.cols.map((col: CardColumnDTO, index: number) => {
            if (index === 1) {
              col.tabs = [
                {
                  colId: null,
                  contentSourceId: null,
                  contentTypeId: 6,
                  id: null,
                  name: this.translateService.instant('common.information'),
                  orderNumber: 0,
                  tabItems: null,
                  templateId: null,
                  type: 'PREFIXED'
                },
                ...col.tabs
              ];
            } else if (col.colType === 'SOCIAL') {
              col.tabs = [
                {
                  id: 1,
                  orderNumber: 1,
                  name: this.translateService.instant(marker('common.comments')),
                  type: 'COMMENTS',
                  contentTypeId: null,
                  contentSourceId: null,
                  tabItems: []
                },
                {
                  id: 2,
                  orderNumber: 2,
                  name: this.translateService.instant(marker('common.clientMessages')),
                  type: 'CLIENT_MESSAGES',
                  contentTypeId: null,
                  contentSourceId: null,
                  tabItems: []
                }
              ];
            }
            return col;
          });
        },
        (error: ConcenetError) => {
          this.globalMessageService.showError({
            message: error.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
          this.spinnerService.hide(spinner);
          this.close();
        }
      );
  }
}
