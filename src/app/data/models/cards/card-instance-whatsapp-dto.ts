import UserDTO from '../user-permissions/user-dto';
import { CardWhatsapptAttachmentDTO } from './card-attachments-dto';
import CardInstanceDTO from './card-instance-dto';
import CardMessageDTO from './card-message';

export default interface CardInstanceWhatsappDTO {
  id?: number;
  attachments?: CardWhatsapptAttachmentDTO[];
  body: string;
  cardInstance?: CardInstanceDTO;
  cardInstanceMessage?: CardMessageDTO;
  dateSend?: Date;
  dateCreated?: number;
  direction?: 'outbound-api' | 'inbound';
  status?: string;
  errorCode?: string;
  errorMessage?: string;
  from?: string;
  to?: string;
  templateId?: string;
  user?: UserDTO;
  whatsappType?: 'CONVERSATION' | 'MESSAGE';
}
