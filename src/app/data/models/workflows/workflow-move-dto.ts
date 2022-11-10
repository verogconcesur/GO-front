import BrandDTO from '../organization/brand-dto';
import DepartmentDTO from '../organization/department-dto';
import FacilityDTO from '../organization/facility-dto';
import SpecialtyDTO from '../organization/specialty-dto';
import RoleDTO from '../user-permissions/role-dto';
import WorkflowSubstateDTO from './workflow-substate-dto';

export default interface WorkflowMoveDTO {
  id: number;
  orderNumber: number;
  requiredFields: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  requiredFieldsList: any[];
  requiredHistoryComment: boolean;
  requiredMyself: boolean;
  requiredSize: boolean;
  requiredUser: boolean;
  roles: RoleDTO[];
  sendMail: boolean;
  sendMailAuto: boolean;
  sendMailReceiverRole: RoleDTO;
  sendMailReceiverType: string;
  sendMailTemplate: {
    brands: BrandDTO[];
    departments: DepartmentDTO[];
    facilities: FacilityDTO[];
    id: number;
    name: string;
    specialties: SpecialtyDTO[];
    templateType: string;
  };
  shortcut: boolean;
  shortcutColor: string;
  shortcutName: string;
  signDocument: boolean;
  signDocumentTemplate: {
    brands: BrandDTO[];
    departments: DepartmentDTO[];
    facilities: FacilityDTO[];
    id: number;
    name: string;
    specialties: SpecialtyDTO[];
    templateType: string;
  };
  workflowSubstateSource: WorkflowSubstateDTO;
  workflowSubstateTarget: WorkflowSubstateDTO;
  workflowSubstateTargetExtra?: WorkflowSubstateDTO;
  movementExtraAuto?: boolean;
  movementExtraConfirm?: boolean;
  requiredMovementExtra?: boolean;
}
