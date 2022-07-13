import { WsException } from '@nestjs/websockets';
import { RoomNotFoundError } from './RoomNotFoundError';

export class WsRoomNotFoundError extends WsException {
  public static message = RoomNotFoundError.message;

  constructor() {
    super(WsRoomNotFoundError.message);
    this.name = this.constructor.name;
  }
}
