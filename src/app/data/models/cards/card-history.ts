import UserDetailsDTO from '../user-permissions/user-details-dto';
import WorkflowDTO from '../workflows/workflow-dto';
import WorkflowSubstateDTO from '../workflows/workflow-substate-dto';
import CardInstanceDTO from './card-instance-dto';

export default interface CardHistoryDTO {
  cardInstance: CardInstanceDTO;
  dateEvent: number;
  description: string;
  eventHistoryType: string;
  id: number;
  newUserAssig: UserDetailsDTO;
  user: UserDetailsDTO;
  workflow: WorkflowDTO;
  workflowSubstateSource: WorkflowSubstateDTO;
  workflowSubstateTarget: WorkflowSubstateDTO;
  initial?: boolean;
  final?: boolean;
}
