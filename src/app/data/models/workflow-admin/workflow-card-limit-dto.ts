import WorkflowSubstateDTO from '../workflows/workflow-substate-dto';

export default interface WorkflowCardsLimitDTO {
  id: number;
  cardsLimit: boolean;
  initTime: number;
  endTime: number;
  numCardsByDay: number;
  numCardsByHour: number;
  allowOverLimit: boolean;
  workflowSubstate: WorkflowSubstateDTO;
}
