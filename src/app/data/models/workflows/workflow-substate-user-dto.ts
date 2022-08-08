import WorkflowCardDto from './workflow-card-dto';

export default interface WorkflowSubstateUserDto {
  id: number;
  permissionType: string;
  workflowSubstateId: number;
  workflowUserId: number;
  substatesIdsToFilter?: number[]; //Used on filter to group similar substates
  cards?: WorkflowCardDto[];
}
