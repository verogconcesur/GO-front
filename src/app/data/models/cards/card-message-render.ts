import MessageChannelDTO from '../templates/message-channels-dto';

export default interface CardMessageRenderDTO {
  messageChannelId?: number;
  messageRender?: string;
  subjectRender?: string;
  templateId?: string;
  attachments?: { id: number; name: string }[];
  messageChannel: MessageChannelDTO;
  cardInstanceRemoteSignatureId?: number;
}
