import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import WorkflowCalendarHourLineDTO, { WorkflowCalendarDayDTO } from '@data/models/workflows/workflow-calendar-hour-line-dto';
import WorkflowCardDTO from '@data/models/workflows/workflow-card-dto';
import { ModalAssociatedCardsService } from '@modules/feature-modules/modal-associated-cards/modal-associated-cards.service';
import _ from 'lodash';
import moment, { Moment } from 'moment';

@Component({
  selector: 'app-workflow-calendar-hour-line',
  templateUrl: './workflow-calendar-hour-line.component.html',
  styleUrls: ['./workflow-calendar-hour-line.component.scss']
})
export class WorkflowCalendarHourLineComponent implements OnInit, AfterViewInit {
  @Input() mode: 'WEEK' | 'DAY' = 'WEEK';
  @Input() first = false;
  @Input() workflowHourLine: WorkflowCalendarHourLineDTO;
  public isCurrentHour = false;
  constructor(private modalAssociatedCardsService: ModalAssociatedCardsService) {}
  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.isCurrentHour && document.getElementById('WorkflowLine')) {
        console.log(document.getElementById('WorkflowLine').offsetHeight);
        const offsetTop = (document.getElementById('WorkflowLine').offsetHeight / 60) * moment().get('minutes');
        const styleTop = 'top:' + offsetTop + 'px';
        document.getElementById('WorkflowTimeLine').setAttribute('style', styleTop);
      }
    }, 1000);
  }

  ngOnInit(): void {
    this.isCurrentHour =
      this.workflowHourLine.hour.isSame(moment(), 'hour') &&
      this.workflowHourLine.days.length &&
      _.some(this.workflowHourLine.days, (dayLine: WorkflowCalendarDayDTO) => dayLine.day.isSame(moment(), 'day'));
  }
  public compareTime(day: Moment, hour?: Moment): boolean {
    if (hour) {
      return day.isSame(moment(), 'day') || this.isCurrentHour;
    } else {
      return day.isSame(moment(), 'day');
    }
  }
  public showCalendarCards(cards: WorkflowCardDTO[]): void {
    this.modalAssociatedCardsService.openAssociatedCardsModal(null, 'calendar', cards);
  }
}
