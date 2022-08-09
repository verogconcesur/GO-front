import WorkflowCardInstanceDto from './workflow-card-instance-dto';
import WorkflowCardSlotDto from './workflow-card-slot-dto';
import WorkflowMoveDto from './workflow-move-dto';

export default interface WorkflowCardDto {
  cardId: number;
  customerId: number;
  id: number;
  repairOrderId: number;
  variableSlots: WorkflowCardSlotDto[];
  vehicleId: number;
  colors: string[];
  movements: WorkflowMoveDto[];
  cardInstanceWorkflows: WorkflowCardInstanceDto[];
}
