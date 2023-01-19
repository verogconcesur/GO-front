import UserDetailsDTO from '../user-permissions/user-details-dto';
import WorkflowDTO from '../workflows/workflow-dto';
import WorkflowSubstateDTO from '../workflows/workflow-substate-dto';
import CardInstanceDTO from './card-instance-dto';
import SwitchboardDataCall from './card-switchboard-data-call-dto';

export default interface CardHistoryDTO {
  cardInstance: CardInstanceDTO;
  dateEvent: number;
  description: string;
  comments: string;
  eventHistoryType: string;
  id: number;
  newUserAssig: UserDetailsDTO;
  user: UserDetailsDTO;
  workflow: WorkflowDTO;
  workflowSubstateSource: WorkflowSubstateDTO;
  workflowSubstateTarget: WorkflowSubstateDTO;
  workflowSubstateTargetExtra?: WorkflowSubstateDTO;
  movementExtraAuto?: boolean;
  movementExtraConfirm?: boolean;
  requiredMovementExtra?: boolean;
  switchboardDataCall?: SwitchboardDataCall;
  initial?: boolean;
  final?: boolean;
}
