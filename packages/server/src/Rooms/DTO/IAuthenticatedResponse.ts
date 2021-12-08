import { User } from '../../User/User';

export interface IAuthenticatedResponse {
  token: string;
  user: ReturnType<User['getUserDetails']>;
}
