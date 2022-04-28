import UserDTO from './user-dto';

export default interface LoginDTO {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_expire_token: number;
  user: UserDTO;
}
