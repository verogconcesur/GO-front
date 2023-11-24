import TreeNode from '@data/interfaces/tree-node';
import CardColumnTabItemDTO from '../cards/card-column-tab-item-dto';
import WorkflowCardDTO from './workflow-card-dto';
import WorkflowCardTabItemDTO from './workflow-card-tab-item-dto';
import WorkflowMoveDTO from './workflow-move-dto';
import WorkflowStateDTO from './workflow-state-dto';
import WorkflowSubstateEventDTO from './workflow-substate-event-dto';
import WorkflowSubstateUserDTO from './workflow-substate-user-dto';

export default interface WorkflowSubstateDTO extends TreeNode {
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
  workflowSubstateEvents?: WorkflowSubstateEventDTO[];
  move?: WorkflowMoveDTO;
}
