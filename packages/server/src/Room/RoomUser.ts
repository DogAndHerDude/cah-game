import { Socket } from 'socket.io';
import { User } from '../User/User';

export interface IPlainRoomUser {
  user: ReturnType<User['toPlain']>;
  spectator: boolean;
}

export class RoomUser {
  constructor(
    public readonly user: User,
    public readonly spectator: boolean,
    public readonly socket: Socket,
  ) {}

  public toPlain(): IPlainRoomUser {
    return {
      user: this.user.toPlain(),
      spectator: this.spectator,
    };
  }
}
