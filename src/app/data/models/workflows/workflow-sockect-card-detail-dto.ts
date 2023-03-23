export default interface WorkflowSocketCardDetailDTO {
  cardInstanceWorkflowId: number;
  message?: 'DETAIL_COMMENTS' | 'DETAIL_MESSAGES' | 'DETAIL_FULL';
}
