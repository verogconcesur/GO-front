import PermissionsDTO from './permissions-dto';
import RoleDTO from './role-dto';

export default interface UserDTO {
  id: number;
  name: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: RoleDTO;
  email: string;
  userName: string;
  password: string;
  permissions: PermissionsDTO[];
}
