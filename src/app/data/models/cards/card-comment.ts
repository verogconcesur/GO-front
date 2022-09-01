import UserDetailsDTO from '../user-permissions/user-details-dto';
import CardInstanceDTO from './card-instance-dto';

export default interface CardCommentDTO {
  cardInstance?: CardInstanceDTO;
  comment?: string;
  dateComment?: string;
  id?: number;
  isNew?: boolean;
  user?: UserDetailsDTO;
  users?: UserDetailsDTO[] | { mention: boolean; user: { id: number } }[];
}
