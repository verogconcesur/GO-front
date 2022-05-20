import BrandDTO from './brand-dto';
import DepartmentDTO from './department-dto';
import FacilityDTO from './facility-dto';
import RoleDTO from './role-dto';
import SpecialtyDTO from './specialty-dto';

export default interface UserFilterDTO {
  brands: BrandDTO[];
  departments: DepartmentDTO[];
  email: string;
  facilities: FacilityDTO[];
  roles: RoleDTO[];
  search: string;
  specialties: SpecialtyDTO[];
}
