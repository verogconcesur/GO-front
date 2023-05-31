import MessageChannelDTO from '../templates/message-channels-dto';
import CardColumnTabDTO from './card-column-tab-dto';
import CardInstanceDTO from './card-instance-dto';
import CardInstanceRemoteSignatureDTO from './card-instance-remote-signature-dto';

export default interface CardMessageDTO {
  cardInstance?: CardInstanceDTO;
  comment?: string;
  dateComment?: string;
  id?: number;
  fullNameSender?: string;
  roleSender?: string;
  sender?: string;
  messageChannels: MessageChannelDTO[];
  budgetTab?: CardColumnTabDTO;
  cardInstanceRemoteSignature?: CardInstanceRemoteSignatureDTO;
}
