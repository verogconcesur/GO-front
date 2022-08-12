import WorkflowCardDto from './workflow-card-dto';
import WorkflowStateDto from './workflow-state-dto';
import WorkflowSubstateUserDto from './workflow-substate-user-dto';

export default interface WorkflowSubstateDto {
  color: string;
  entryPoint: boolean;
  exitPoint: boolean;
  hideBoard: boolean;
  id: number;
  locked: boolean;
  name: string;
  orderNumber: number;
  workflowSubstateUser: WorkflowSubstateUserDto[];
  substatesIdsToFilter?: number[]; //Used on filter to group similar substates
  workflowState?: WorkflowStateDto;
  cards?: WorkflowCardDto[];
}
