import { Server } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { CardService } from '../Cards/CardService';
import { Room } from '../Room/Room';
import { User } from '../User/User';
import { InternalRoomEvents } from '../Room/RoomEvents';
import { RoomNotFoundError } from './Errors/RoomNotFoundError';
import { UserInRoomError } from './Errors/UserInRoomError';

@Injectable()
export class RoomService {
  private readonly rooms = new Map<string, Room>();

  constructor(private readonly cardService: CardService) {}

  public createRoom(user: User, server: Server): Room {
    if (!!this.getRoomByUserID(user.id)) {
      throw new UserInRoomError();
    }

    const room = new Room(user, server, this.cardService);

    this.handleOutgoingRoomEvents(room);
    this.rooms.set(room.roomID, room);

    return room;
  }

  public listRooms(): Array<Room> {
    return Array.from(this.rooms.values());
  }

  public getRoom(roomID: string): Room | undefined {
    return this.rooms.get(roomID);
  }

  public getRoomByUserID(userID: string): Room | undefined {
    return Array.from(this.listRooms()).find((room) => {
      const roomUser = room
        .listUsers()
        .find((roomUser) => roomUser.user.id === userID);

      return !!roomUser;
    });
  }

  public removeRoom(roomID: string): void {
    this.rooms.delete(roomID);
  }

  public addUser(user: User, roomID: string, spectator: boolean): Room {
    const room = this.getRoom(roomID);

    if (!room) {
      throw new RoomNotFoundError();
    }

    if (!!this.getRoomByUserID(user.id)) {
      throw new UserInRoomError();
    }

    room.addUser(user, spectator);

    return room;
  }

  public removeUser({
    userID,
    roomID,
  }: {
    userID: string;
    roomID?: string;
  }): void {
    let room: Room | undefined;

    if (roomID) {
      room = this.getRoom(roomID);
    } else {
      room = this.getRoomByUserID(userID);
    }

    if (!room) {
      return;
    }

    room.removeUser(userID);
  }

  private handleOutgoingRoomEvents(room: Room): void {
    room.on(InternalRoomEvents.ROOM_CLOSED, this.destroyRoom);
    room.on(InternalRoomEvents.USER_LEAVE, this.removeUser);
  }

  private destroyRoom = (roomID: string): void => {
    this.rooms.delete(roomID);
  };
}
