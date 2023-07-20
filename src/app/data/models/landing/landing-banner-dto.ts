import { AttachmentDTO } from '../cards/card-attachments-dto';

export default interface LandingBannerDTO {
  description: string;
  endDate: number;
  id: number;
  image: AttachmentDTO;
  initDate: number;
  link: string;
  orderNumber: number;
  title: string;
}
