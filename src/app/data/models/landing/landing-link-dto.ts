import { AttachmentDTO } from '../cards/card-attachments-dto';

export default interface LandingLinkDTO {
  icon: AttachmentDTO;
  id: number;
  link: string;
  name: string;
  orderNumber: number;
  typeLink: 'MENU' | 'SOCIAL';
}
