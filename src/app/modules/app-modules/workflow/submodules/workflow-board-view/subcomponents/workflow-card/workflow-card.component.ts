import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import WorkflowCardDTO from '@data/models/workflows/workflow-card-dto';
import WorkflowCardSlotDTO from '@data/models/workflows/workflow-card-slot-dto';
import WorkflowCardTabItemDTO from '@data/models/workflows/workflow-card-tab-item-dto';
import WorkflowStateDTO from '@data/models/workflows/workflow-state-dto';
import WorkflowSubstateDTO from '@data/models/workflows/workflow-substate-dto';
import { WorkflowDragAndDropService } from '@modules/app-modules/workflow/aux-service/workflow-drag-and-drop.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-workflow-card',
  templateUrl: './workflow-card.component.html',
  styleUrls: ['./workflow-card.component.scss']
})
export class WorkflowCardComponent implements OnInit {
  @Input() card: WorkflowCardDTO;
  @Input() wState: WorkflowStateDTO;
  @Input() wSubstate: WorkflowSubstateDTO;
  @Input() droppableStates: string[];
  @Output() isDraggingEvent: EventEmitter<boolean> = new EventEmitter();
  public cardSize = 'size-m';
  public labels = {
    dueOutDateTime: marker('workflows.dueOutDateTime')
  };
  public readonly dragStartDelay = 100; //To prevent drag a card on tablet when user is scrolling

  constructor(
    private translateService: TranslateService,
    private dragAndDropService: WorkflowDragAndDropService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getCardSize();
  }

  public getColors(): string[] {
    return this.card?.colors?.length ? this.card.colors : [];
  }

  public getColorsClass(): string {
    return `x-${this.getColors().length}`;
  }

  public getLabel(tabItem: WorkflowCardTabItemDTO): string {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let slot: any = null;
    switch (tabItem.typeItem) {
      case 'ACTION':
        slot = tabItem.tabItemConfigAction;
        break;
      case 'INPUT':
        slot = tabItem.tabItemConfigInput.variable;
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
    switch (slot.attributeName) {
      case 'dueOutDateTime':
        return this.translateService.instant('workflows.dueOutDateTime', {
          date: datePipe.transform(slot.value, 'dd/MM'),
          time: datePipe.transform(slot.value, 'HH:mm')
        });
      default:
        return slot.value;
    }
  }

  public getCardSize(): void {
    if (this.card.size) {
      this.cardSize = 'size-' + this.card.size.toLowerCase();
    }
  }

  public showCardInfo(): void {
    //Firefox => para evitar que al arrastrar abra el detalle de la tarjeta
    if (!this.dragAndDropService.draggingCard$.value) {
      this.router.navigate([{ outlets: { card: ['wcId', this.card.cardInstanceWorkflows[0].id] } }], {
        relativeTo: this.route,
        state: {
          relativeTo: JSON.stringify(this.route, this.replacerFunc),
          card: JSON.stringify(this.card)
        }
      });
    }
  }

  public setCardDragging(dragging: boolean): void {
    if (dragging) {
      this.isDraggingEvent.next(true);
      this.dragAndDropService.draggingCard$.next(this.card);
      this.dragAndDropService.droppableStates$.next(this.droppableStates);
    } else {
      this.isDraggingEvent.next(false);
      this.dragAndDropService.droppableStates$.next([]);
      //Firefox => para evitar que al arrastrar abra el detalle de la tarjeta
      setTimeout(() => this.dragAndDropService.draggingCard$.next(null));
    }
  }

  private replacerFunc = () => {
    const visited = new WeakSet();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, prefer-arrow/prefer-arrow-functions
    return (key: string, value: any) => {
      if (typeof value === 'object' && value !== null) {
        if (visited.has(value)) {
          return;
        }
        visited.add(value);
      }
      return value;
    };
  };
}
