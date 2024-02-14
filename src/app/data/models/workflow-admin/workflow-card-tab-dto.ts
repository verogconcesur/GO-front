import WorkflowCardTabItemPermissionDTO from './workflow-card-tab-item-permissions-dto';
import WorkflowCardTabPermissionsDTO from './workflow-card-tab-permissions-dto';
import WorkflowCardTabTAIPermissionDTO from './workflow-card-tab-tai-permissions-dto';

export default interface WorkflowCardTabDTO {
  id?: number;
  tabId?: number;
  workflowId?: number;
  workflowCardTabPermissions?: WorkflowCardTabPermissionsDTO[];
  workflowCardTabItemPermissions?: WorkflowCardTabItemPermissionDTO[];
  workflowCardTabTAIPermissions?: WorkflowCardTabTAIPermissionDTO[];
}
