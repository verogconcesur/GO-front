/* eslint-disable @typescript-eslint/no-explicit-any */
import WorkflowStateDTO from './workflow-state-dto';
import WorkflowSubstateDTO from './workflow-substate-dto';
import WorkflowSubstateUserDTO from './workflow-substate-user-dto';

export default interface WorkflowFilterDTO {
  states: WorkflowStateDTO[] | any[];
  subStates: WorkflowSubstateDTO[] | any[];
  users: WorkflowSubstateUserDTO[] | any[];
  priorities: string[];
  substatesWithCards: 'BOTH' | 'WITH_CARDS' | 'WHITHOUT_CARDS';
}
