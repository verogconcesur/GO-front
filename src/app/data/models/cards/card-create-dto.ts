import WorkflowSubstateUserDTO from '../workflows/workflow-substate-user-dto';

export default interface CardCreateDTO {
  workflowId: number;
  cardInstance: {
    vehicleId?: number;
    customerId?: number;
    information?: string;
    userId?: number;
  };
  cardInstanceWorkflowUsers?: { user: { id: number } }[];
  workflowSubstateId: number;
  facilityId: number;
}
