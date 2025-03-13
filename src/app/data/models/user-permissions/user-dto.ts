/* eslint-disable @typescript-eslint/no-explicit-any */
import BrandDTO from '../organization/brand-dto';
import DepartmentDTO from '../organization/department-dto';
import FacilityDTO from '../organization/facility-dto';
import SpecialtyDTO from '../organization/specialty-dto';
import PermissionsDTO from './permissions-dto';
import RoleDTO from './role-dto';

export default interface UserDTO {
  id: number;
  name?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  brands?: BrandDTO[];
  facilities?: FacilityDTO[];
  departments?: DepartmentDTO[];
  specialties?: SpecialtyDTO[];
  phoneNumber?: string;
  showReviewContact?: boolean;
  role?: RoleDTO;
  email?: string;
  userName?: string;
  password?: string;
  permissions?: PermissionsDTO[];
  showAll?: boolean;
  signature?: string;
  signatureContentType?: string;
  code?: string;
  userType?: string;
  dueDatePass?: any;
  customer?: any;
  userSendPassType?: any;
}
