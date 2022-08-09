export default interface WorkflowCardInstanceDto {
  cardInstanceId: number;
  cardInstanceWorkflowUsers: {
    dateAssignment: string;
    id: number;
    userId: number;
  }[];
  id: number;
  workflowId: number;
  workflowSubstateId: number;
}
