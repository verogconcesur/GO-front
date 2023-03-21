export default interface WorkflowSocketMoveDTO {
  cardInstanceWorkflowId: number;
  message?: 'MOVEMENT' | 'NEW_CARD' | 'UPDATE_DATA';
}
