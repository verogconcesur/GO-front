import WorkflowCardTabPermissionsDTO from './workflow-card-tab-permissions-dto';

export default interface WorkflowCardTabDTO {
  id?: number;
  tabId?: number;
  workflowId?: number;
  workflowCardTabPermissions?: WorkflowCardTabPermissionsDTO[];
}
