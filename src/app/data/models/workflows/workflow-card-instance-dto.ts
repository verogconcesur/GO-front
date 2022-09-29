import WorkflowCardDTO from './workflow-card-dto';

export default interface WorkflowCardInstanceDTO {
  // cardInstance: WorkflowCardDTO;
  cardInstanceId: number;
  cardInstanceWorkflowUsers: {
    dateAssignment: string;
    id: number;
    userId: number;
  }[];
  id: number;
  facilityId: number;
  size: 'S' | 'M' | 'L' | 'XL';
  orderNumber: number;
  workflowId: number;
  workflowSubstateId: number;
}
