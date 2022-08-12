import UserDTO from '../user-dto';
import WorkflowCardDto from './workflow-card-dto';

export default interface WorkflowSubstateUserDto {
  id: number;
  permissionType: string;
  workflowSubstateId: number;
  user: UserDTO;
  substatesIdsToFilter?: number[]; //Used on filter to group similar substates
  cards?: WorkflowCardDto[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cardsBySubstateId?: any;
}
