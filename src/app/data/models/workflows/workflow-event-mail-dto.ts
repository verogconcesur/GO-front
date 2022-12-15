import TemplatesCommunicationDTO from '../templates/templates-communication-dto';
import RoleDTO from '../user-permissions/role-dto';

export interface WorkflowEventMailReceiverDTO {
  id: number;
  receiverType: 'CLIENT' | 'ADVISER' | 'ASIGNED' | 'FOLLOWERS' | 'ROLE' | 'OTHER';
  role?: RoleDTO;
  emails?: string;
}

export default interface WorkflowEventMailDTO {
  id: number;
  sendMailAuto: boolean;
  sendMailTemplate: TemplatesCommunicationDTO;
  workflowEventMailReceivers: WorkflowEventMailReceiverDTO[];
}
