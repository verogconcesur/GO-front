import CardColumnTabItemDTO from '../cards/card-column-tab-item-dto';
import TemplatesCommunicationDTO from '../templates/templates-communication-dto';
import RoleDTO from '../user-permissions/role-dto';

export default interface WorkflowSubstateEventDTO {
  id: number;
  requiredFields: boolean;
  requiredFieldsList: CardColumnTabItemDTO[];
  requiredMyself?: boolean;
  requiredSize?: boolean;
  requiredUser?: boolean;
  requiredHistoryComment?: boolean;
  requiredUserId?: number;
  sendMail?: boolean;
  sendMailAuto?: boolean;
  sendMailReceiverRole?: RoleDTO;
  sendMailReceiverType?: string;
  sendMailTemplate?: TemplatesCommunicationDTO;
  signDocument?: boolean;
  signDocumentTemplate?: TemplatesCommunicationDTO;
  historyComment?: string;
  size?: 'S' | 'M' | 'L' | 'XL';
  substateEventType?: 'IN' | 'OUT' | 'MOV';
  templateComunication?: TemplatesCommunicationDTO;
}
