import { Moment } from 'moment';
import WorkflowCardDTO from './workflow-card-dto';

export default interface WorkflowCalendarHourLineDTO {
  hour: Moment;
  days: WorkflowCalendarDayDTO[];
}
export interface WorkflowCalendarDayDTO {
  day: Moment;
  cards: WorkflowCardDTO[];
}
