import WorkflowDto from './workflow-dto';
import WorkflowSubstateDto from './workflow-substate-dto';

export default interface WorkflowStateDto {
  id: number;
  name: string;
  anchor: boolean;
  color: string;
  front: boolean;
  hideBoard: boolean;
  locked: boolean;
  orderNumber: number;
  cardCount: number;
  userCount: number;
  workflow: WorkflowDto;
  workflowSubstates: WorkflowSubstateDto[];
}
