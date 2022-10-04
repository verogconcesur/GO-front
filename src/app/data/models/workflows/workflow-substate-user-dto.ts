import UserDTO from '../user-permissions/user-dto';
import WorkflowCardDTO from './workflow-card-dto';

export default interface WorkflowSubstateUserDTO {
  id: number;
  permissionType: string;
  workflowSubstateId: number;
  user: UserDTO;
  substatesIdsToFilter?: number[]; //Used on filter to group similar substates
  cards?: WorkflowCardDTO[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cardsBySubstateId?: any;
  name?: string;
}
