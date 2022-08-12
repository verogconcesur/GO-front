import BrandDTO from '../brand-dto';
import DepartmentDTO from '../department-dto';
import FacilityDTO from '../facility-dto';
import RoleDTO from '../role-dto';
import SpecialtyDTO from '../specialty-dto';
import WorkflowSubstateDto from './workflow-substate-dto';

export default interface WorkflowMoveDto {
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
  workflowSubstateSource: WorkflowSubstateDto;
  workflowSubstateTarget: WorkflowSubstateDto;
}
