import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { RouteConstants } from '@app/constants/route.constants';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import WorkflowCardDTO from '@data/models/workflows/workflow-card-dto';
import WorkflowCardTabItemDTO from '@data/models/workflows/workflow-card-tab-item-dto';
import WorkflowStateDTO from '@data/models/workflows/workflow-state-dto';
import WorkflowSubstateDTO from '@data/models/workflows/workflow-substate-dto';
import { WorkflowDragAndDropService } from '@modules/app-modules/workflow/aux-service/workflow-drag-and-drop.service';
import { TasksModalComponent } from '@modules/feature-modules/workflow-card-tasks/tasks-modal/tasks-modal.component';
import { TranslateService } from '@ngx-translate/core';
import { htmlToStringConverter } from '@shared/utils/html-to-string-function';
import { replacerFunc } from '@shared/utils/replacer-function';

@Component({
  selector: 'app-workflow-card',
  templateUrl: './workflow-card.component.html',
  styleUrls: ['./workflow-card.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class WorkflowCardComponent implements OnInit {
  @Input() card: WorkflowCardDTO;
  @Input() wState: WorkflowStateDTO;
  @Input() wSubstate: WorkflowSubstateDTO;
  @Input() wUserId: number;
  @Input() droppableStates: string[] = [];
  @Input() disableDrag = false;
  @Input() forceSize: 'size-s' | 'size-m' | 'size-l' | 'size-xl';
  @Input() showExtraInfo = true;
  @Input() navigationMode: 'relative' | 'absolute' = 'relative';
  @Input() additionalInfo: string;
  @Input() additionalInfoIcon: string;
  @Input() showAdditionalInfo = false;
  @Input() viewedBtn = false;
  @Output() viewedAction: EventEmitter<boolean> = new EventEmitter();
  @Output() isDraggingEvent: EventEmitter<boolean> = new EventEmitter();
  public cardSize = 'size-m';
  public cardId: number;
  public labels = {
    dueOutDateTime: marker('workflows.dueOutDateTime')
  };
  public cardInfoExpanded = false;
  public cardAdditionalInfoExpanded = false;
  public readonly dragStartDelay = 300; //To prevent drag a card on tablet when user is scrolling

  constructor(
    private translateService: TranslateService,
    private dragAndDropService: WorkflowDragAndDropService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getCardSize();
  }

  public getAdditionalInfoString(): string {
    if (this.additionalInfo) {
      return htmlToStringConverter(this.additionalInfo);
    }
    return '';
  }

  public extraInfoValue(): string {
    let extraInfo = '';
    if (this.card.information) {
      extraInfo = this.card.information;
    }
    if (
      this.card.cardInstanceWorkflows &&
      this.card.cardInstanceWorkflows.length &&
      this.card.cardInstanceWorkflows[0].information
    ) {
      extraInfo = this.card.cardInstanceWorkflows[0].information;
    }
    return extraInfo;
  }

  public getColors(): string[] {
    return this.card?.colors?.length ? this.card.colors : [];
  }

  public getColorsClass(): string {
    return `x-${this.getColors().length}`;
  }

  public expandCardInfo(): void {
    this.cardInfoExpanded = !this.cardInfoExpanded;
  }

  public expandAddiontalInfo(): void {
    this.cardAdditionalInfoExpanded = !this.cardAdditionalInfoExpanded;
  }

  public getCardSizeClass(): string {
    if (this.cardInfoExpanded || this.cardAdditionalInfoExpanded) {
      return `${this.cardSize} expanded`;
    }
    return this.cardSize;
  }

  public getLabel(tabItem: WorkflowCardTabItemDTO): string {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let slot: any = null;
    switch (tabItem.typeItem) {
      case 'ACTION':
        slot = tabItem.tabItemConfigAction;
        break;
      case 'INPUT':
        slot = tabItem.tabItemConfigInput.cardTabItemInstance;
        break;
      case 'LINK':
        slot = tabItem.tabItemConfigLink;
        break;
      case 'LIST':
        slot = tabItem.tabItemConfigList.variable;
        break;
      case 'OPTION':
        slot = tabItem.tabItemConfigOption.variable;
        break;
      case 'TABLE':
        slot = tabItem.tabItemConfigTable.variable;
        break;
      case 'TEXT':
        slot = tabItem.tabItemConfigText.variable;
        break;
      case 'TITLE':
        slot = tabItem.tabItemConfigTitle.variable;
        break;
      case 'VARIABLE':
        slot = tabItem.tabItemConfigVariable.variable;
        break;
    }
    const datePipe = new DatePipe('en-EN');
    const attrname = slot?.attributeName ? slot.attributeName : '';
    switch (attrname) {
      case 'dueOutDateTime':
        return this.translateService.instant('workflows.dueOutDateTime', {
          date: datePipe.transform(slot.value, 'dd/MM'),
          time: datePipe.transform(slot.value, 'HH:mm')
        });
      default:
        return slot?.value ? slot.value : null;
    }
  }

  public getCardSize(): void {
    if (this.forceSize) {
      this.cardSize = this.forceSize;
    } else if (this.card.cardInstanceWorkflows[0].size) {
      this.cardSize = 'size-' + this.card.cardInstanceWorkflows[0].size.toLowerCase();
    }
  }

  public showTasks(): void {
    this.dialog.open(TasksModalComponent, { data: { cardId: this.card.cardInstanceWorkflows[0].id } });
  }

  public showCardInfo(): void {
    //Firefox => para evitar que al arrastrar abra el detalle de la tarjeta
    if (!this.dragAndDropService.draggingCard$.value) {
      if (this.navigationMode === 'relative') {
        this.router.navigate(
          [
            {
              outlets: {
                card: [
                  RouteConstants.WORKFLOWS_ID_CARD,
                  this.card.cardInstanceWorkflows[0].id,
                  RouteConstants.WORKFLOWS_ID_USER,
                  this.wUserId
                ]
              }
            }
          ],
          {
            relativeTo: this.route,
            state: {
              relativeTo: JSON.stringify(this.route, replacerFunc),
              card: JSON.stringify(this.card)
            }
          }
        );
      } else {
        const currentUrl = window.location.hash.split('#/').join('/');
        let wId = null; //this.card.cardInstanceWorkflows[0].workflowId;
        let view = RouteConstants.WORKFLOWS_BOARD_VIEW;
        if (currentUrl.indexOf(RouteConstants.WORKFLOWS) >= 0 && currentUrl.indexOf(RouteConstants.WORKFLOWS_BOARD_VIEW) >= 0) {
          const id = parseInt(
            currentUrl.split(RouteConstants.WORKFLOWS + '/')[1].split('/' + RouteConstants.WORKFLOWS_BOARD_VIEW)[0],
            10
          );
          wId = id ? id : wId;
        } else if (
          currentUrl.indexOf(RouteConstants.WORKFLOWS) >= 0 &&
          currentUrl.indexOf(RouteConstants.WORKFLOWS_CALENDAR_VIEW) >= 0
        ) {
          view = RouteConstants.WORKFLOWS_CALENDAR_VIEW;
          const id = parseInt(
            currentUrl.split(RouteConstants.WORKFLOWS + '/')[1].split('/' + RouteConstants.WORKFLOWS_CALENDAR_VIEW)[0],
            10
          );
          wId = id ? id : wId;
        } else if (
          currentUrl.indexOf(RouteConstants.WORKFLOWS) >= 0 &&
          currentUrl.indexOf(RouteConstants.WORKFLOWS_TABLE_VIEW) >= 0
        ) {
          view = RouteConstants.WORKFLOWS_TABLE_VIEW;
          const id = parseInt(
            currentUrl.split(RouteConstants.WORKFLOWS + '/')[1].split('/' + RouteConstants.WORKFLOWS_TABLE_VIEW)[0],
            10
          );
          wId = id ? id : wId;
        }
        if (wId) {
          this.router.navigateByUrl(
            '/dashboard/workflow/' +
              wId +
              '/' +
              view +
              '/(card:wcId/' +
              this.card.cardInstanceWorkflows[0].id +
              '/wuId/' +
              (this.wUserId ? this.wUserId : 'null') +
              ')'
          );
        } else {
          this.router.navigateByUrl(
            '/dashboard/workflow/' +
              view +
              '/(card:wcId/' +
              this.card.cardInstanceWorkflows[0].id +
              '/wuId/' +
              (this.wUserId ? this.wUserId : 'null') +
              ')'
          );
        }
      }
    }
  }

  public setCardDragging(dragging: boolean): void {
    if (dragging) {
      this.isDraggingEvent.next(true);
      this.dragAndDropService.draggingCard$.next(this.card);
      this.dragAndDropService.droppableStates$.next(this.droppableStates);
    } else {
      this.isDraggingEvent.next(false);
      this.dragAndDropService.droppableStates$.next(null);
      //Firefox => para evitar que al arrastrar abra el detalle de la tarjeta
      setTimeout(() => this.dragAndDropService.draggingCard$.next(null));
    }
  }
}
