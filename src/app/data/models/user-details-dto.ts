import BrandDTO from './brand-dto';
import Department from './department-dto';
import FacilityDTO from './facility-dto';
import PermissionsDTO from './permissions-dto';
import RoleDTO from './role-dto';
import SpecialtyDTO from './specialty-dto';

export default interface UserDetailsDTO {
  id: number;
  name: string;
  firstName: string;
  lastName: string;
  role: RoleDTO;
  email: string;
  userName: string;
  password: string;
  permissions: PermissionsDTO[];
  brands: BrandDTO[];
  facilities: FacilityDTO[];
  departments: Department[];
  specialties: SpecialtyDTO[];
}
