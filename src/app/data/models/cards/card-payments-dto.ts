import { CardBudgetAttachmentsDTO, CardPaymentAttachmentsDTO } from './card-attachments-dto';
import CardColumnTabDTO from './card-column-tab-dto';
import CardInstanceDTO from './card-instance-dto';

export interface CardPaymentLineDTO {
  id?: number;
  amount?: number;
  attachments?: CardPaymentAttachmentsDTO[];
  cardInstancePaymentDTO?: CardPaymentsDTO;
  description?: PaymentDescriptionDTO;
  observations?: string;
  paymentType?: PaymentTypeDTO;
  paymentStatus?: PaymentStatusDTO;
}

export interface CardTotalLineDTO {
  id?: number;
  amount?: number;
  attachments?: CardPaymentAttachmentsDTO[];
  cardInstancePaymentDTO?: CardPaymentsDTO;
  description?: PaymentDescriptionDTO;
  observations?: string;
}

export interface CardTotalDetailDTO {
  id: number;
  amount: number;
  attachments: CardPaymentAttachmentsDTO[];
  cardInstancePaymentDTO?: CardPaymentsDTO;
  description: PaymentDescriptionDTO;
  observations: string;
}

export interface CardPaymentsDTO {
  id?: number;
  cardInstance?: CardInstanceDTO;
  paymentLines?: CardPaymentLineDTO[];
  pending?: number;
  paymentTotals?: CardTotalLineDTO[];
  paymentTotalDetails?: CardTotalDetailDTO[];
  total?: number;
  tab?: CardColumnTabDTO;
  customerAccount?: string;
}

export interface PaymentTypeDTO {
  id: number;
  name: string;
}

export interface PaymentStatusDTO {
  id: number;
  name?: string;
}

export interface PaymentDescriptionDTO {
  id: number;
  description: string;
}

export interface PaymentPosibleDescriptionDTO {
  paymentDescriptions: PaymentDescriptionDTO[];
  totalBreakdownDescriptions: PaymentDescriptionDTO[];
  totalDetailDescriptions: PaymentDescriptionDTO[];
}
