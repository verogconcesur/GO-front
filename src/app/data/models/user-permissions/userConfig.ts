import UserDTO from '../user-permissions/user-dto';

export default interface UserConfigDTO {
  user?: UserDTO;
  id?: number;
  extra?: boolean;
  hideMoveButton?: boolean;
  hideSendButton?: boolean;
}
