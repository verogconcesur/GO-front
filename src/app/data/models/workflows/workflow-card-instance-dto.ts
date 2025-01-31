import UserDTO from '../user-permissions/user-dto';
import WorkflowCardDTO from './workflow-card-dto';
import WorkflowSubstateEventDTO from './workflow-substate-event-dto';
import WorkflowSubstateUserDTO from './workflow-substate-user-dto';

export const TypeFilterCard: string[] = [
  'VEHICLE_LICENSE_PLATE',
  'VEHICLE_VIN',
  'CUSTOMER_SOCIAL_ID',
  'CUSTOMER_FULL_NAME',
  'REPAIR_ORDER_REFERENCE',
  'REPAIR_ORDER_ID',
  'INVENTORY_COMMISSION_NUMBER',
  'CARD_TAG_1',
  'CARD_TAG_2',
  'CARD_TAG_3'
];

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
  following?: boolean;
}
