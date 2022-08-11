/* eslint-disable @typescript-eslint/no-explicit-any */
import WorkflowStateDto from './workflow-state-dto';
import WorkflowSubstateDto from './workflow-substate-dto';
import WorkflowSubstateUserDto from './workflow-substate-user-dto';

export default interface WorkflowFilterDto {
  states: WorkflowStateDto[] | any[];
  subStates: WorkflowSubstateDto[] | any[];
  users: WorkflowSubstateUserDto[] | any[];
  priorities: string[];
  substatesWithCards: boolean;
}
