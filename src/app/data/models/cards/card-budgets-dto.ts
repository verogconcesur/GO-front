import { AttachmentDTO } from './card-attachments-dto';

export interface CardBudgetsDTO {
  id?: number;
  accepted?: boolean;
  description: string;
  amount: number;
  workflowId?: number;
  selected?: boolean;
  attachments?: AttachmentDTO[];
}
