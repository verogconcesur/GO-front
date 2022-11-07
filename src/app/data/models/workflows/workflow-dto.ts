import BrandDTO from '../organization/brand-dto';
import DepartmentDTO from '../organization/department-dto';
import FacilityDTO from '../organization/facility-dto';
import SpecialtyDTO from '../organization/specialty-dto';
export enum WorkFlowStatusEnum {
  draft = 'DRAFT',
  published = 'PUBLISHED'
}
export default interface WorkflowDTO {
  id: number;
  name: string;
  status: string;
  manualCreateCard?: boolean;
  facilities?: FacilityDTO[];
  brands?: BrandDTO[];
  departments?: DepartmentDTO[];
  specialties?: SpecialtyDTO[];
}
