import RoleDTO from '../user-permissions/role-dto';
export enum WorkFlowCardPermissionsEnum {
  hide = 'HIDE',
  show = 'SHOW',
  edit = 'EDIT'
}
export default interface WorkflowCardTabPermissionsDTO {
  id?: number;
  permissionType: WorkFlowCardPermissionsEnum;
  role: RoleDTO;
  workflowCardTabId?: number;
}
