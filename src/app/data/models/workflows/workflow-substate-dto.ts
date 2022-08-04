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
  idsToFilter?: number[]; //Used on filter to group similar substates
}
