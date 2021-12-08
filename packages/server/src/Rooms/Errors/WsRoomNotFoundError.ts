import { WsException } from '@nestjs/websockets';

export class WsRoomNotFoundError extends WsException {
  public static message = 'Room not found';

  constructor() {
    super(WsRoomNotFoundError.message);
    this.name = this.constructor.name;
  }
}
