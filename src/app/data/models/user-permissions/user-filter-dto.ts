import BrandDTO from '../organization/brand-dto';
import DepartmentDTO from '../organization/department-dto';
import FacilityDTO from '../organization/facility-dto';
import SpecialtyDTO from '../organization/specialty-dto';
import RoleDTO from './role-dto';

export default interface UserFilterDTO {
  brands: BrandDTO[];
  departments: DepartmentDTO[];
  email: string;
  facilities: FacilityDTO[];
  roles: RoleDTO[];
  search: string;
  specialties: SpecialtyDTO[];
}
