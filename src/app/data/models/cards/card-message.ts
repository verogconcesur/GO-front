import MessageChannelDTO from '../templates/message-channels-dto';
import CardInstanceDTO from './card-instance-dto';

export default interface CardMessageDTO {
  cardInstance?: CardInstanceDTO;
  comment?: string;
  dateComment?: string;
  id?: number;
  fullNameSender?: string;
  roleSender?: string;
  sender?: string;
  messageChannels: MessageChannelDTO[];
}
