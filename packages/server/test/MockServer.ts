import { Server } from 'socket.io';
import { MockSocket } from './MockSocket';

export class MockServer {
  public readonly __sockets = new Map<string, MockSocket>();

  constructor(sockets: Array<MockSocket> = []) {
    sockets.forEach((socket) => this.__sockets.set(socket.id, socket));
  }

  in = jest.fn((room: string) => this);
  emit = jest.fn((event: string, data: any) => this);

  __addSockets(sockets: Array<MockSocket>): void {
    sockets.forEach((socket) => this.__sockets.set(socket.id, socket));
  }

  __clear(): void {
    this.__sockets.clear();
  }

  __asServer(): Server {
    return this as unknown as Server;
  }
}
