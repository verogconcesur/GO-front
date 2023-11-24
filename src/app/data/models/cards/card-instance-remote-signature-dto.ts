import TemplatesChecklistsDTO from '../templates/templates-checklists-dto';
import UserDTO from '../user-permissions/user-dto';
import { AttachmentDTO, CardAttachmentsDTO } from './card-attachments-dto';
import CardInstanceDTO from './card-instance-dto';

export default interface CardInstanceRemoteSignatureDTO {
  cardInstance: CardInstanceDTO;
  cardInstanceAttachment: CardAttachmentsDTO;
  file: AttachmentDTO;
  id: number;
  readDate: Date | number;
  rejectReason: string;
  signDate: Date | number;
  signIp: string;
  signLatitude: string;
  signLongitude: string;
  signSendPinDueDate: Date | number;
  signSendPinMode: 'EMAIL' | 'SMS';
  signSendPinSystem: string;
  signSendPinUser: string;
  signUserId: number;
  status: 'PENDING' | 'SIGNED' | 'REJECTED' | 'CANCELED';
  templateChecklist: TemplatesChecklistsDTO;
  userSender: UserDTO;
}
