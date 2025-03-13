import { PermissionConstants } from '@app/constants/permission.constants';
import CardColumnTabDTO from './card-column-tab-dto';
import CardInstanceDTO from './card-instance-dto';

export interface AttachmentDTO {
  content: string;
  id?: number;
  name: string;
  size?: number;
  thumbnail?: string;
  type: string;
  showInLanding?: boolean;
  attachmentsTab?: string;
  attachmentsCategory?: string;
}
export interface CustomerAttachmentDTO {
  active?: boolean;
  auto?: boolean;
  createDate?: string;
  createdByFullName?: string;
  customerId?: number;
  file?: {
    content: string;
    id?: number;
    name: string;
    size?: number;
    thumbnail?: string;
    type: string;
    showInLanding?: boolean;
  };
  id?: number;
  updateDate?: string;
  updatedByFullName?: string;
}
export interface ConfigEntityCardAttachmentsDTO {
  attachments?: CustomerAttachmentDTO[];
  templateAttachmentItem?: {
    id: number;
    name: string;
    orderNumber: number;
  };
  permissionType?: PermissionConstants;
  tabId?: number;
  tabName?: string;
}

export interface CardAttachmentsDTO {
  attachments: AttachmentDTO[];
  templateAttachmentItem: {
    id: number;
    name: string;
    orderNumber: number;
  };
  permissionType?: PermissionConstants;
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
export interface CardInstanceAttachmentDTO {
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
export interface CardWhatsapptAttachmentDTO {
  file: AttachmentDTO;
}

export interface errorAttachmentDTO {
  id?: number;
  numMinAttachRequired?: number;
  tab?: {
    colId: number;
    id: number;
    name: string;
    templateId: number;
  };
  templateAttachmentItem?: {
    id: number;
    name: string;
    orderNumber: number;
  };
}
