import { User } from '../User';

export class CreateUserResponseDTO {
  constructor(public readonly user: User, public readonly token: string) {}
}
