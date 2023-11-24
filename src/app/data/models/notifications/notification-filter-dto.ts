export default interface NotificationFilterDTO {
  dateNotificationFrom?: string;
  dateNotificationTo?: string;
  notificationTypes?: (
    | 'CHANGE_STATE'
    | 'EDIT_INFO'
    | 'ASIG_USER'
    | 'END_WORK'
    | 'ADD_COMMENT'
    | 'ADD_DOC'
    | 'ADD_MESSAGE_CLIENT'
  )[];
  readFilterType?: 'READ' | 'NO_READ' | 'ALL';
  userId?: number;
}
