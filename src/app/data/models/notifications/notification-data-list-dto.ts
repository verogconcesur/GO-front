import WorkflowCardDTO from '../workflows/workflow-card-dto';

export default interface NotificationDataListDTO {
  dateNotification: Date;
  id: number;
  notification: string;
  notificationType: ('CHANGE_STATE' | 'EDIT_INFO' | 'NEW_CARD' | 'END_WORK' | 'ADD_COMMENT' | 'ADD_DOC' | 'ADD_MESSAGE_CLIENT')[];
  read: boolean;
  cardInstance: WorkflowCardDTO;
}
