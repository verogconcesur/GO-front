export default interface WorkflowCalendarBodyDTO {
  facilityIds: number[];
  viewCalendarDateTimeItem: {
    id: number;
    name: string;
    type: 'VARIABLE' | 'TABITEM';
  };
  fromDate: string;
  toDate: string;
}
