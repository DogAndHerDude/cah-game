import { WsException } from '@nestjs/websockets';

export class WsNotAuthorized extends WsException {
  public static message = 'Not authorized';

  constructor() {
    super(WsNotAuthorized.message);
    this.name = this.constructor.name;
  }
}
