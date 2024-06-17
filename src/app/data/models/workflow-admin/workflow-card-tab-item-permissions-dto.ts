import RoleDTO from '../user-permissions/role-dto';
export default interface WorkflowCardTabItemPermissionDTO {
  id?: number;
  permissionType: string;
  role: RoleDTO;
  tabItemId: number;
  workflowCardTabId?: number;
}
