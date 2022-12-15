import CardColumnTabItemDTO from '../cards/card-column-tab-item-dto';
import BrandDTO from '../organization/brand-dto';
import DepartmentDTO from '../organization/department-dto';
import FacilityDTO from '../organization/facility-dto';
import SpecialtyDTO from '../organization/specialty-dto';
import TemplatesCommunicationDTO from '../templates/templates-communication-dto';
import RoleDTO from '../user-permissions/role-dto';
import WorkflowEventMailDTO from './workflow-event-mail-dto';
import WorkflowSubstateDTO from './workflow-substate-dto';

export default interface WorkflowMoveDTO {
  id: number;
  orderNumber: number;
  requiredFields: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  requiredFieldsList: CardColumnTabItemDTO[];
  requiredHistoryComment: boolean;
  requiredMyself: boolean;
  requiredSize: boolean;
  requiredUser: boolean;
  roles: RoleDTO[];
  sendMail: boolean;
  workflowEventMails: WorkflowEventMailDTO[];
  shortcut: boolean;
  shortcutColor: string;
  shortcutName: string;
  signDocument: boolean;
  signDocumentTemplate: TemplatesCommunicationDTO;
  workflowSubstateSource: WorkflowSubstateDTO;
  workflowSubstateTarget: WorkflowSubstateDTO;
  workflowSubstateTargetExtra?: WorkflowSubstateDTO;
  movementExtraAuto?: boolean;
  movementExtraConfirm?: boolean;
  requiredMovementExtra?: boolean;
}
