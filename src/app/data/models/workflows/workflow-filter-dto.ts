/* eslint-disable @typescript-eslint/no-explicit-any */
import WorkflowStateDTO from './workflow-state-dto';
import WorkflowSubstateDTO from './workflow-substate-dto';
import WorkflowSubstateUserDTO from './workflow-substate-user-dto';
import BrandDTO from '../organization/brand-dto';
import DepartmentDTO from '../organization/department-dto';
import FacilityDTO from '../organization/facility-dto';
import SpecialtyDTO from '../organization/specialty-dto';
import RoleDTO from '../user-permissions/role-dto';

export default interface WorkflowFilterDTO {
  states: WorkflowStateDTO[] | any[];
  subStates: WorkflowSubstateDTO[] | any[];
  users: WorkflowSubstateUserDTO[] | any[];
  priorities: string[];
  substatesWithCards: 'BOTH' | 'WITH_CARDS' | 'WHITHOUT_CARDS';
}

export interface WorkflowSearchFilterDTO {
  brands: BrandDTO[];
  departments: DepartmentDTO[];
  facilities: FacilityDTO[];
  search: string;
  specialties: SpecialtyDTO[];
  status: 'DRAFT' | 'PUBLISHED' | '';
}
