import WorkflowSubstateUserDTO from '../workflows/workflow-substate-user-dto';

export default interface CardCreateDTO {
  workflowId: number;
  cardInstance: {
    vehicleId?: number;
    customerId?: number;
    information?: string;
    vehicleInventoryId?: number;
    userId?: number;
    repairOrderId?: number;
  };
  dateAppliTimeLimit?: number;
  cardInstanceWorkflowUsers?: WorkflowSubstateUserDTO[];
  workflowSubstateId: number;
  facilityId: number;
  customerCardInstanceAttachments: CardCustomersAttachmentsDTO[];
}
export interface CardCustomersAttachmentsDTO {
  tabId: number;
  templateAttachmentItemId: number;
  customerAttachmentId: number;
}
