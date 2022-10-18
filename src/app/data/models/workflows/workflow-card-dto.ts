import WorkflowCardInstanceDTO from './workflow-card-instance-dto';
import WorkflowCardTabItemDTO from './workflow-card-tab-item-dto';
import WorkflowMoveDTO from './workflow-move-dto';

export default interface WorkflowCardDTO {
  cardId: number;
  customerId: number;
  id: number;
  repairOrderId: number;
  tabItems: WorkflowCardTabItemDTO[];
  vehicleId: number;
  colors: string[];
  movements: WorkflowMoveDTO[];
  cardInstanceWorkflows: WorkflowCardInstanceDTO[];
  countCompletedTasks?: number;
  countTotalTasks?: number;
}
