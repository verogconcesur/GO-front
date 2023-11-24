export default interface WorkflowSocketCardDetailDTO {
  cardInstanceWorkflowId: number;
  userId?: number;
  message?: 'DETAIL_COMMENTS' | 'DETAIL_MESSAGES' | 'DETAIL_FULL';
}
