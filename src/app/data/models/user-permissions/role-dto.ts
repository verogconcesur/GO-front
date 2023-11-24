import PermissionsDTO from './permissions-dto';

export default interface RoleDTO {
  id: number;
  name: string;
  selected?: boolean;
  permissions?: PermissionsDTO[];
}
