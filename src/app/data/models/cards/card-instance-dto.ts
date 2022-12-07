/* eslint-disable @typescript-eslint/no-explicit-any */
import UserDTO from '../user-permissions/user-dto';
import WorkflowCardInstanceDTO from '../workflows/workflow-card-instance-dto';
import CardDTO from './card-dto';

export default interface CardInstanceDTO {
  card: CardDTO;
  cardInstanceWorkflow: WorkflowCardInstanceDTO;
  follower: boolean;
  reference: string;
  repairOrderId: string;
  users: { cardInstanceWorkflow: any; dateAssignment: number; id: number; userId: number; user?: UserDTO }[];
  workflowId: number;
  workflowName: string;
  workflowStateId: number;
  workflowStateName: string;
  workflowSubstateId: number;
  workflowSubstateName: string;
  colors: any[];
  information: {
    dateAssignmentSubstate: number;
    instanceInformation: string;
    orderInformation: string;
    sourceText: string;
    userInformation: string;
  };
}
