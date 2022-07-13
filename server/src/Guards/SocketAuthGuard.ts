import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthService } from '../AuthService/AuthService';
import { WsInvalidCredentials } from './WsInvalidCredentials';
import { WsNotAuthorized } from './WsNotAuthorized';

@Injectable()
export class SocketAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const host = context.switchToWs();
    const client = host.getClient();
    const { auth } = client.handshake;

    if (!auth?.token) {
      throw new WsNotAuthorized();
    }

    const decoded = this.authService.validateToken(auth.token);

    if (!decoded) {
      throw new WsInvalidCredentials();
    }

    client.decoded = decoded;

    return true;
  }
}
