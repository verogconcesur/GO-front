/* eslint-disable @typescript-eslint/no-explicit-any */
import CardDTO from './card-dto';

export default interface CardInstanceDTO {
  card: CardDTO;
  follower: boolean;
  reference: string;
  repairOrderId: string;
  users: { cardInstanceWorkflow: any; dateAssignment: number; id: number; userId: number }[];
  workflowId: number;
  workflowName: string;
  workflowStateId: number;
  workflowStateName: string;
  workflowSubstateId: number;
  workflowSubstateName: string;
  colors: any[];
}
