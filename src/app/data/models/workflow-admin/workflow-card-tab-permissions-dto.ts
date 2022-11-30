import RoleDTO from '../user-permissions/role-dto';
export enum WorkFlowPermissionsEnum {
  hide = 'HIDE',
  show = 'SHOW',
  edit = 'EDIT'
}
export default interface WorkflowCardTabPermissionsDTO {
  id?: number;
  permissionType: string;
  role: RoleDTO;
  workflowCardTabId?: number;
}
