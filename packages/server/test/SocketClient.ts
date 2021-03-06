import io, { Socket, ManagerOptions, SocketOptions } from 'socket.io-client';

export class SocketClient {
  public static URI = 'http://localhost:3000';
  public static config: Parameters<typeof io>[1] = {
    transports: ['websocket'],
  };

  private client: Socket;

  constructor(config?: Partial<ManagerOptions & SocketOptions>) {
    this.client = io(SocketClient.URI, config ?? SocketClient.config);
  }

  public connect(): void {
    this.client.connect();
  }

  public disconnect(): Promise<void> {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (this.client.disconnected) {
          clearInterval(interval);
          resolve();
        }
      }, 1);

      this.client.disconnect();
    });
  }

  public async onConnected(): Promise<void | unknown> {
    return new Promise((resolve, reject) => {
      this.client.on('connect', () => resolve(undefined));
      this.client.on('connect_error', (error) => reject(error));
    });
  }

  public async onEvent<T = unknown>(event: string): Promise<T> {
    return new Promise((resolve) => {
      this.client.on(event, (data: T) => resolve(data));
    });
  }

  public emit<T = any>(event: string, data?: T): void {
    this.client.emit(event, data);
  }
}
