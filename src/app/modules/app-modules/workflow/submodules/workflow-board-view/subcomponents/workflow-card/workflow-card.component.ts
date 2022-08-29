import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import WorkflowCardDto from '@data/models/workflows/workflow-card-dto';
import WorkflowCardSlotDto from '@data/models/workflows/workflow-card-slot-dto';
import WorkflowStateDto from '@data/models/workflows/workflow-state-dto';
import WorkflowSubstateDto from '@data/models/workflows/workflow-substate-dto';
import { WorkflowDragAndDropService } from '@modules/app-modules/workflow/aux-service/workflow-drag-and-drop.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-workflow-card',
  templateUrl: './workflow-card.component.html',
  styleUrls: ['./workflow-card.component.scss']
})
export class WorkflowCardComponent implements OnInit {
  @Input() card: WorkflowCardDto;
  @Input() wState: WorkflowStateDto;
  @Input() wSubstate: WorkflowSubstateDto;
  @Input() droppableStates: string[];
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
    return [
      this.wSubstate?.color ? this.wSubstate.color : this.wState?.color ? this.wState.color : '#fff',
      ...(this.card?.colors?.length ? this.card.colors : [])
    ];
  }

  public getColorsClass(): string {
    return `x-${this.getColors().length}`;
  }

  public getLabel(slot: WorkflowCardSlotDto): string {
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
    console.log('show info:', this.card);
    this.router.navigate([{ outlets: { card: ['wcId', this.card.id] } }], {
      relativeTo: this.route,
      state: {
        relativeTo: JSON.stringify(this.route, this.replacerFunc),
        card: JSON.stringify(this.card)
      }
    });
  }

  public setCardDragging(dragging: boolean): void {
    if (dragging) {
      this.dragAndDropService.draggingCard$.next(this.card);
      this.dragAndDropService.droppableStates$.next(this.droppableStates);
    } else {
      this.dragAndDropService.draggingCard$.next(null);
      this.dragAndDropService.droppableStates$.next([]);
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
