import CardColumnTabItemDTO from '../cards/card-column-tab-item-dto';
import TemplatesCommunicationDTO from '../templates/templates-communication-dto';
import RoleDTO from '../user-permissions/role-dto';
import WorkflowEventMailDTO from './workflow-event-mail-dto';
import WorkflowSubstateDTO from './workflow-substate-dto';

export default interface WorkflowSubstateEventDTO {
  id: number;
  requiredFields: boolean;
  requiredFieldsList: CardColumnTabItemDTO[];
  requiredMyself?: boolean;
  requiredSize?: boolean;
  requiredUser?: boolean;
  requiredHistoryComment?: boolean;
  requiredUserId?: number;
  movementExtraAuto?: boolean;
  movementExtraConfirm?: boolean;
  requiredMovementExtra?: boolean;
  sendMail?: boolean;
  workflowEventMails: WorkflowEventMailDTO[];
  signDocument?: boolean;
  signDocumentTemplate?: TemplatesCommunicationDTO;
  historyComment?: string;
  size?: 'S' | 'M' | 'L' | 'XL';
  substateEventType?: 'IN' | 'OUT' | 'MOV';
  templateComunication?: TemplatesCommunicationDTO;
  workflowSubstateTargetExtra?: WorkflowSubstateDTO;
}
