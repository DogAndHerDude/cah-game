import { Socket } from 'socket.io';
import uniqid from 'uniqid';

export interface IUserPlain {
  id: string;
  name: string;
}

export class User {
  public readonly id: string;

  constructor(
    public readonly name: string,
    public socket: Socket,
    id?: string,
  ) {
    this.id = id || uniqid();
  }

  public getUserDetails(): { id: string; name: string } {
    return {
      id: this.id,
      name: this.name,
    };
  }

  public toPlain(): IUserPlain {
    return {
      id: this.id,
      name: this.name,
    };
  }
}
