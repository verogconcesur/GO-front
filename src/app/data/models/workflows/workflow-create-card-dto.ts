import CardDTO from '../cards/card-dto';
import WorkflowStateDTO from './workflow-state-dto';

export default interface WorkflowCreateCardDTO {
  id: number;
  name: string;
  status: string;
  facilities: { id: number; name: string }[];
  workflowStates: WorkflowStateDTO[];
  card: CardDTO;
}
