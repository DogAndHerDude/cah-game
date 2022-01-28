import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { User } from './User';
import { AuthService } from '../AuthService/AuthService';
import { NameTakenError } from './NameTakenError';

@Injectable()
export class UserService {
  private readonly users = new Map<string, User>();

  public createUser(name: string, socket: Socket): User {
    if (this.isUserNameTaken(name)) {
      throw new NameTakenError();
    }

    const user = new User(name, socket, socket.id);

    this.users.set(user.id, user);

    return user;
  }

  public getUser(id: string): User | undefined {
    return this.users.get(id);
  }

  public removeUser(id: string): void {
    this.users.delete(id);
  }

  private isUserNameTaken(name: string): boolean {
    return (
      Array.from(this.users.values()).find((user) => user.name === name) !==
      undefined
    );
  }
}
