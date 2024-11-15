import {
  AccountingTaxTypeDTO,
  TemplateAccountingItemDTO,
  TemplateAccountingItemLineDTO
} from '../templates/templates-accounting-dto';
import { CardAttachmentsDTO, CardInstanceAttachmentDTO } from './card-attachments-dto';

export interface CardAccountingDTO {
  taxType: AccountingTaxTypeDTO;
  accountingBlocks: CardAccountingBlockDTO[];
  locked: boolean;
}

export interface CardAccountingBlockDTO {
  accountingLines: CardAccountingLineDTO[];
  amountTotal: number;
  amountTotalPlusTax: number;
  amountTotalTax: number;
  attachments: CardAttachmentsDTO[] | CardInstanceAttachmentDTO[];
  cardInstanceId: number;
  id: number;
  tabId: number;
  templateAccountingItem: TemplateAccountingItemDTO;
}

export interface CardAccountingLineDTO {
  amount: number;
  description: string;
  attachments: CardAttachmentsDTO[] | CardInstanceAttachmentDTO[];
  cardInstanceId: number;
  id: number;
  tabId: number;
  taxType: AccountingTaxTypeDTO;
  templateAccountingItemLine: TemplateAccountingItemLineDTO;
}
