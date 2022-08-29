/* eslint-disable @typescript-eslint/no-explicit-any */
import CardDto from './card-dto';

export default interface CardInstanceDto {
  card: CardDto;
  follower: boolean;
  repairOrderId: string;
  users: { cardInstanceWorkflow: any; dateAssignment: number; id: number; userId: number }[];
  workflowId: number;
  workflowName: string;
  workflowStateColor: string;
  workflowStateId: number;
  workflowStateName: string;
  workflowSubstateColor: null;
  workflowSubstateId: number;
  workflowSubstateName: string;
}
