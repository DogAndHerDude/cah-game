import uniqid from 'uniqid';
import { Socket } from 'socket.io';

export class MockSocket {
  public id = uniqid();
  public eventStack = new Map<string, (arg: any) => void>();
  public decoded: { id?: string; name?: string } = {};

  public join = jest.fn((room: string) => this);
  public leave = jest.fn((room: string) => this);
  public emit = jest.fn((event: string, data: any) => this);
  public to = jest.fn((roomID: string) => this);
  public on = jest.fn((event: string, callback: (args: any) => void) => {
    this.eventStack.set(event, callback);
  });

  public __emitToSelf(event: string, data?: any) {
    const callback = this.eventStack.get(event);

    callback && callback(data);
  }

  public __asSocket(): Socket {
    return this as unknown as Socket;
  }
}
