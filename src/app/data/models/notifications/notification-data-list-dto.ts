export default interface NotificationDataListDTO {
  cardInstanceWorkflowId: number;
  dateNotification: string;
  facilityName: string;
  id: number;
  notification: string;
  notificationType: ('CHANGE_STATE' | 'EDIT_INFO' | 'NEW_CARD' | 'END_WORK' | 'ADD_COMMENT' | 'ADD_DOC' | 'ADD_MESSAGE_CLIENT')[];
  read: boolean;
  userAsignId: number;
  workflowId: number;
  workflowName: string;
  workflowStateName: string;
  workflowSubstateFront: boolean;
  workflowSubstateName: string;
}
