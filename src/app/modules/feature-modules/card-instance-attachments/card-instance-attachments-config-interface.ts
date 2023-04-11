import { AttachmentDTO, CardAttachmentsDTO } from '@data/models/cards/card-attachments-dto';

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

export interface CardInstanceAttachmentsModalVersionConfig {
  cardInstanceAttachmentsConfig: CardInstanceAttachmentsConfig;
  data: CardAttachmentsDTO[];
  selected: AttachmentDTO[];
  cardInstanceWorkflowId: number;
  tabId: number;
  title?: string;
  confirmButtonLabel?: string;
}
