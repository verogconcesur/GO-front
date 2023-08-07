import { Injectable } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { DateRange, MatDateRangeSelectionStrategy } from '@angular/material/datepicker';
import moment, { Moment } from 'moment';

@Injectable()
export class MaxRangeSelectionStrategy<D> implements MatDateRangeSelectionStrategy<D> {
  constructor(private dateAdapter: DateAdapter<D>) {}

  selectionFinished(date: D | null): DateRange<D> {
    return this.createFiveDayRange(date);
  }

  createPreview(activeDate: D | null): DateRange<D> {
    return this.createFiveDayRange(activeDate);
  }

  private createFiveDayRange(date: D | null): DateRange<D> {
    let currentDate: Moment | Date;

    if (date) {
      currentDate = moment(date as unknown as Date);
      currentDate = currentDate.startOf('week').toDate();

      const start = this.dateAdapter.addCalendarDays(currentDate as unknown as D, 0);
      const end = this.dateAdapter.addCalendarDays(currentDate as unknown as D, 6);
      return new DateRange<D>(start, end);
    }

    return new DateRange<D>(null, null);
  }
}
