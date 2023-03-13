import WorkflowCardInstanceDTO from './workflow-card-instance-dto';
import WorkflowCardTabItemDTO from './workflow-card-tab-item-dto';
import WorkflowMoveDTO from './workflow-move-dto';
import WorkflowSubstateDTO from './workflow-substate-dto';

export default interface WorkflowCardDTO {
  cardId: number;
  customerId: number;
  id: number;
  repairOrderId: number;
  tabItems: WorkflowCardTabItemDTO[];
  vehicleId: number;
  colors: string[];
  cardInstanceWorkflows: WorkflowCardInstanceDTO[];
  movements?: WorkflowMoveDTO[];
  information?: string;
  countCompletedTasks?: number;
  countTotalTasks?: number;
  workflowSubstate?: WorkflowSubstateDTO;
  expandInfo?: boolean;
}
