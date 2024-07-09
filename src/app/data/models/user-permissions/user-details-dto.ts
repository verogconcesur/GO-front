import BrandDTO from '../organization/brand-dto';
import DepartmentDTO from '../organization/department-dto';
import FacilityDTO from '../organization/facility-dto';
import SpecialtyDTO from '../organization/specialty-dto';
import PermissionsDTO from './permissions-dto';
import RoleDTO from './role-dto';

export default interface UserDetailsDTO {
  id: number;
  name: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  role: RoleDTO;
  email: string;
  code: string;
  userId: string;
  userName: string;
  password: string;
  permissions: PermissionsDTO[];
  brands: BrandDTO[];
  facilities: FacilityDTO[];
  departments: DepartmentDTO[];
  specialties: SpecialtyDTO[];
  signature: string;
  signatureContentType: string;
}
