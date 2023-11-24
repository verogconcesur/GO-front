import BrandDTO from '../organization/brand-dto';
import DepartmentDTO from '../organization/department-dto';
import FacilityDTO from '../organization/facility-dto';
import SpecialtyDTO from '../organization/specialty-dto';
export default interface WorkflowOrganizationDTO {
  id?: number;
  facilities?: FacilityDTO[];
  brands?: BrandDTO[];
  departments?: DepartmentDTO[];
  specialties?: SpecialtyDTO[];
}
