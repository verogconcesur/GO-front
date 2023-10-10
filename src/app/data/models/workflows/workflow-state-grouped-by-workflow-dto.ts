import TreeNode from '@data/interfaces/tree-node';
import WorkflowStateDTO from './workflow-state-dto';

export default interface WorkflowStateGroupedByWorkflowDTO extends TreeNode {
  workflowId: number;
  workflowName: string;
  workflowStates: WorkflowStateDTO[];
}
