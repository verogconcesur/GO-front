import {
  AccountingTaxTypeDTO,
  TemplateAccountingItemDTO,
  TemplateAccountingItemLineDTO
} from '../templates/templates-accounting-dto';
import { CardAttachmentsDTO } from './card-attachments-dto';

export interface CardAccountingDTO {
  accountingBlocks: CardAccountingBlockDTO[];
}

export interface CardAccountingBlockDTO {
  accountingLines: CardAccountingLineDTO[];
  amountTotal: number;
  amountTotalPlusTax: number;
  amountTotalTax: number;
  attachments: CardAttachmentsDTO[];
  cardInstanceId: number;
  id: number;
  tabId: number;
  templateAccountingItem: TemplateAccountingItemDTO;
}

export interface CardAccountingLineDTO {
  amount: number;
  attachments: CardAttachmentsDTO[];
  cardInstanceId: number;
  id: number;
  tabId: number;
  taxType: AccountingTaxTypeDTO;
  templateAccountingItemLine: TemplateAccountingItemLineDTO;
}
