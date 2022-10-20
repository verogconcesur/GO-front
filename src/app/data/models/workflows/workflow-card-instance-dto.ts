import UserDTO from '../user-permissions/user-dto';
import WorkflowCardDTO from './workflow-card-dto';
import WorkflowSubstateEventDTO from './workflow-substate-event-dto';

export default interface WorkflowCardInstanceDTO {
  // cardInstance: WorkflowCardDTO;
  cardInstanceId: number;
  cardInstanceWorkflowUsers: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cardInstanceWorkflow: any;
    dateAssignment: string;
    id: number;
    userId: number;
    user?: UserDTO;
  }[];
  id: number;
  facilityId: number;
  size: 'S' | 'M' | 'L' | 'XL';
  orderNumber: number;
  workflowId: number;
  workflowSubstateId: number;
  workflowSubstateEvents: WorkflowSubstateEventDTO[];
  information?: string;
}
