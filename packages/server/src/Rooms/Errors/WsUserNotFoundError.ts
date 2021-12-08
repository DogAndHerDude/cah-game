import { WsException } from '@nestjs/websockets';

export class WsUserNotFoundError extends WsException {
  public static readonly message = 'User not found';

  constructor() {
    super(WsUserNotFoundError.message);
    this.name = this.constructor.name;
  }
}
