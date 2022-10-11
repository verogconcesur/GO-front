export default interface CardInstanceAttachmentsConfig {
  tabId: number;
  wcId: number;
  permission?: string;
  disableAttachmentsAddition?: boolean;
  disableAttachmentsSelection?: boolean;
  disableIndividualDeleteAction?: boolean;
  disableIndividualDownloadAction?: boolean;
  disableEditFileName?: boolean;
}
