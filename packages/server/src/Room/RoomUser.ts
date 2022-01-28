import { Socket } from 'socket.io';
import { User } from '../User/User';

export interface IPlainRoomUser {
  user: ReturnType<User['toPlain']>;
  spectator: boolean;
}

export class RoomUser {
  public socket: Socket;

  constructor(public readonly user: User, public readonly spectator: boolean) {
    this.socket = user.socket;
  }

  public toPlain(): IPlainRoomUser {
    return {
      user: this.user.toPlain(),
      spectator: this.spectator,
    };
  }
}
