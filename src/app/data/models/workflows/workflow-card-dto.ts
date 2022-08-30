import WorkflowCardInstanceDTO from './workflow-card-instance-dto';
import WorkflowCardSlotDTO from './workflow-card-slot-dto';
import WorkflowMoveDTO from './workflow-move-dto';

export default interface WorkflowCardDTO {
  cardId: number;
  customerId: number;
  id: number;
  repairOrderId: number;
  variableSlots: WorkflowCardSlotDTO[];
  vehicleId: number;
  colors: string[];
  movements: WorkflowMoveDTO[];
  cardInstanceWorkflows: WorkflowCardInstanceDTO[];
  size: 'S' | 'M' | 'L' | 'XL';
  orderNumber: number;
}
