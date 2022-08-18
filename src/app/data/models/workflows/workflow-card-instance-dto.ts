import WorkflowCardDto from './workflow-card-dto';

export default interface WorkflowCardInstanceDto {
  cardInstance: WorkflowCardDto;
  cardInstanceWorkflowUsers: {
    dateAssignment: string;
    id: number;
    userId: number;
  }[];
  id: number;
  workflowId: number;
  workflowSubstateId: number;
}
