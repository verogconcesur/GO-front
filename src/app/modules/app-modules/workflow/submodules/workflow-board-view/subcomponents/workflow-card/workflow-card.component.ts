import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
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

  public labels = {
    dueOutDateTime: marker('workflows.dueOutDateTime')
  };

  constructor(private translateService: TranslateService, private dragAndDropService: WorkflowDragAndDropService) {}

  ngOnInit(): void {}

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

  public showCardInfo(): void {
    console.log('show info:', this.card);
  }

  public setCardDragging(dragging: boolean): void {
    this.dragAndDropService.draggingCard$.next(dragging);
  }
}
