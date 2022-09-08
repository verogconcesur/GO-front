export default interface CardHistoryFilterDTO {
  cardInstanceWorkflowId: number;
  dateEventFrom?: string;
  dateEventTo?: string;
  eventHistoryTypes?: string[];
  workflows?: number[];
}
