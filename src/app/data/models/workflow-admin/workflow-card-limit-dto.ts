import RoleDTO from '../user-permissions/role-dto';
import WorkflowSubstateDTO from '../workflows/workflow-substate-dto';

export const MAX_CARDS_LIMIT_BY_DAY = 888888;

export interface CardLimitSlotDTO {
  cards: number;
  hourFrom: number;
  hourTo: number;
  maxReached?: boolean;
}
export interface CardLimitSlotByDayDTO {
  day: string;
  totalCards: number;
  carLimitSlots: CardLimitSlotDTO[];
}
export default interface WorkflowCardsLimitDTO {
  id: number;
  cardsLimit: boolean;
  initTime: number;
  endTime: number;
  numCardsByDay: number;
  numCardsByHour: number;
  allowSaturdaysAdvanceNotice: boolean;
  allowOverLimit: boolean;
  workflowSubstate: WorkflowSubstateDTO;
  minDaysAdvanceNotice: number;
  allowOverLimitRoles: RoleDTO[];
}
