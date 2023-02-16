export default interface WarningDTO {
  lastDateNoReadMention: string | number;
  lastDateNoReadNotification: string | number;
  lastDateRequest: string | number;
  existsNoReadMention: boolean;
  existsNoReadNotification: boolean;
  newNoReadMention: boolean;
  newNoReadNotification: boolean;
  frontLastHeaderMentionOpenedTime?: string | number;
  frontLastHeaderNotificationOpenedTime?: string | number;
}
