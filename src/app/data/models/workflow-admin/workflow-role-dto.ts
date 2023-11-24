export default interface WorkflowRoleDTO {
  id: number;
  name: string;
  selected?: boolean;
  userCount?: number;
  workflowId?: number;
}
