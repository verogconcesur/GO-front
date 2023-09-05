import { CardBudgetAttachmentsDTO, CardPaymentAttachmentsDTO } from './card-attachments-dto';
import CardColumnTabDTO from './card-column-tab-dto';
import CardInstanceDTO from './card-instance-dto';

export interface CardPaymentLineDTO {
  id?: number;
  amount?: number;
  attachments?: CardPaymentAttachmentsDTO[];
  cardInstancePaymentDTO?: CardPaymentsDTO;
  description?: string;
  observations?: string;
  paymentType?: PaymentTypeDTO;
  paymentState?: PaymentStatesDTO;
}

export interface CardPaymentsDTO {
  id?: number;
  cardInstance?: CardInstanceDTO;
  paymentLines?: CardPaymentLineDTO[];
  pending?: number;
  total?: number;
  tab?: CardColumnTabDTO;
}

export interface PaymentTypeDTO {
  id: number;
  name: string;
}

export interface PaymentStatesDTO {
  id: number;
  name?: string;
}
