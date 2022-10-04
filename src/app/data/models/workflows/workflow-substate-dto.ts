import WorkflowCardDTO from './workflow-card-dto';
import WorkflowCardTabItemDTO from './workflow-card-tab-item-dto';
import WorkflowStateDTO from './workflow-state-dto';
import WorkflowSubstateUserDTO from './workflow-substate-user-dto';

export default interface WorkflowSubstateDTO {
  color: string;
  entryPoint: boolean;
  exitPoint: boolean;
  hideBoard: boolean;
  id: number;
  locked: boolean;
  name: string;
  orderNumber: number;
  workflowSubstateUser: WorkflowSubstateUserDTO[];
  substatesIdsToFilter?: number[]; //Used on filter to group similar substates
  workflowState?: WorkflowStateDTO;
  cards?: WorkflowCardDTO[];
  cardOrderCustomDir?: string;
  cardOrderCustomItem?: WorkflowCardTabItemDTO;
  cardOrderType?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children?: any[];
}
