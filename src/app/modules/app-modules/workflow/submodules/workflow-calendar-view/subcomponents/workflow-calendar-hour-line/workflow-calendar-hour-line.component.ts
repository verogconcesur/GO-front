import { Component, Input, OnInit } from '@angular/core';
import WorkflowCalendarHourLineDTO, { WorkflowCalendarDayDTO } from '@data/models/workflows/workflow-calendar-hour-line-dto';
import moment, { Moment } from 'moment';

@Component({
  selector: 'app-workflow-calendar-hour-line',
  templateUrl: './workflow-calendar-hour-line.component.html',
  styleUrls: ['./workflow-calendar-hour-line.component.scss']
})
export class WorkflowCalendarHourLineComponent implements OnInit {
  @Input() mode: 'WEEK' | 'DAY' = 'WEEK';
  @Input() first = false;
  @Input() workflowHourLine: WorkflowCalendarHourLineDTO;

  constructor() {}

  ngOnInit(): void {}
  public compareTime(day: Moment, hour?: Moment): boolean {
    if (hour) {
      return day.isSame(moment(), 'day') || hour.isSame(moment(), 'hour');
    } else {
      return day.isSame(moment(), 'day');
    }
  }
}
