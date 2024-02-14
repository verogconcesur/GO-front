import RoleDTO from '../user-permissions/role-dto';
export default interface WorkflowCardTabTAIPermissionDTO {
  id?: number;
  permissionType: string;
  role: RoleDTO;
  templateAttachmentItemId: number;
  workflowCardTabId?: number;
}
