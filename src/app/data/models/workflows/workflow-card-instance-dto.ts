import UserDTO from '../user-permissions/user-dto';
import WorkflowCardDTO from './workflow-card-dto';
import WorkflowSubstateEventDTO from './workflow-substate-event-dto';
import WorkflowSubstateUserDTO from './workflow-substate-user-dto';

export default interface WorkflowCardInstanceDTO {
  cardInstance?: WorkflowCardDTO;
  cardInstanceId: number;
  cardInstanceWorkflowUsers: WorkflowSubstateUserDTO[];
  id: number;
  facilityId: number;
  size: 'S' | 'M' | 'L' | 'XL';
  orderNumber: number;
  workflowId: number;
  workflowName: string;
  workflowSubstateId: number;
  workflowSubstateName: string;
  workflowSubstateEvents: WorkflowSubstateEventDTO[];
  information?: string;
  dateAssignmentSubstate?: number;
  calendarDate?: string;
  dateAppliTimeLimit?: number;
}
