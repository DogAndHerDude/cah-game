import { WsException } from '@nestjs/websockets';
import { UserInRoomError } from './UserInRoomError';

export class WsUserInRoomError extends WsException {
  public static readonly message = UserInRoomError.message;

  constructor() {
    super(WsUserInRoomError.message);
    this.name = this.constructor.name;
  }
}
