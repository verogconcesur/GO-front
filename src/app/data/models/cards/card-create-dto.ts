import WorkflowSubstateUserDTO from '../workflows/workflow-substate-user-dto';

export default interface CardCreateDTO {
  workflowId: number;
  cardInstance: {
    vehicleId?: number;
    customerId?: number;
    information?: string;
    userId?: number;
  };
  cardInstanceWorkflowUsers?: WorkflowSubstateUserDTO[];
  workflowSubstateId: number;
  facilityId: number;
}
