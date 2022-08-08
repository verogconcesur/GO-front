import WorkflowCardSlotDto from './workflow-card-slot-dto';

export default interface WorkflowCardDto {
  cardId: number;
  customerId: number;
  id: number;
  repairOrderId: number;
  variableSlots: WorkflowCardSlotDto[];
  vehicleId: number;
  substateId: number;
  userId: number;
  dateAssignment: number;
}
