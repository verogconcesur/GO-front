import CardColumnTabDTO from './card-column-tab-dto';
import CardInstanceDTO from './card-instance-dto';

export interface AttachmentDTO {
  content: string;
  id: number;
  name: string;
  size: number;
  thumbnail: string;
  type: string;
  showInLanding?: boolean;
}

export interface CardAttachmentsDTO {
  attachments: AttachmentDTO[];
  templateAttachmentItem: {
    id: number;
    name: string;
    orderNumber: number;
  };
  tabId?: number;
  tabName?: string;
}
export interface CardBudgetAttachmentsDTO {
  tab: CardColumnTabDTO;
  cardInstance: CardInstanceDTO;
  file: AttachmentDTO;
  templateAttachmentItem: {
    id: number;
    name: string;
    orderNumber: number;
  };
  id?: number;
}
export interface CardPaymentAttachmentsDTO {
  tab: CardColumnTabDTO;
  cardInstance: CardInstanceDTO;
  file: AttachmentDTO;
  templateAttachmentItem: {
    id: number;
    name: string;
    orderNumber: number;
  };
  id?: number;
}
