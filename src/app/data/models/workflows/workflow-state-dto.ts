import TreeNode from '@data/interfaces/tree-node';
import WorkflowDTO from './workflow-dto';
import WorkflowSubstateDTO from './workflow-substate-dto';
import WorkflowSubstateUserDTO from './workflow-substate-user-dto';

export default interface WorkflowStateDTO extends TreeNode {
  id: number;
  name: string;
  anchor: boolean;
  color: string;
  front: boolean;
  hideBoard: boolean;
  locked: boolean;
  orderNumber: number;
  workflow: WorkflowDTO;
  cardCount?: number;
  userCount?: number;
  workflowSubstates: WorkflowSubstateDTO[];
  workflowUsers?: WorkflowSubstateUserDTO[];
}
