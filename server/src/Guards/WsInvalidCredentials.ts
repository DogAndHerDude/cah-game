import { WsException } from '@nestjs/websockets';

export class WsInvalidCredentials extends WsException {
  public static message = 'Invalid credentials';

  constructor() {
    super(WsInvalidCredentials.message);
    this.name = this.constructor.name;
  }
}
