import WorkflowCardDTO from './workflow-card-dto';

export default interface WorkflowCardInstanceDTO {
  cardInstance: WorkflowCardDTO;
  cardInstanceWorkflowUsers: {
    dateAssignment: string;
    id: number;
    userId: number;
  }[];
  id: number;
  workflowId: number;
  workflowSubstateId: number;
}
