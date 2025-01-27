import UserDTO from './user-dto';

export default interface LoginDTO {
  access_token: string;
  token_type: string;
  expires_in: number;
  project_version: string;
  refresh_expire_token: number;
  user: UserDTO;
  require2FA: boolean;
  defaultMode2FA: string;
}
