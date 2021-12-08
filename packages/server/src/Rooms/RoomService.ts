import { Server } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { CardService } from '../Cards/CardService';
import { UserService } from '../User/UserService';
import { Room } from '../Room/Room';
import { User } from '../User/User';
import { RoomEvents } from '../Room/RoomEvents';

@Injectable()
export class RoomService {
  private readonly rooms = new Map<string, Room>();

  constructor(
    private readonly userService: UserService,
    private readonly cardService: CardService,
  ) {}

  public listRooms(): IterableIterator<Room> {
    return this.rooms.values();
  }

  public getRoom(roomID: string): Room | undefined {
    return this.rooms.get(roomID);
  }

  public createRoom(user: User, server: Server): Room {
    const room = new Room(user, server, this.cardService);

    this.handleOutgoingRoomEvents(room);
    this.rooms.set(room.roomID, room);

    return room;
  }

  public removeRoom(roomID: string): void {
    this.rooms.delete(roomID);
  }

  private handleOutgoingRoomEvents(room: Room): void {
    room.on(RoomEvents.CLOSE_ROOM, this.destroyRoom);
  }

  private destroyRoom = (roomID: string): void => {
    this.rooms.delete(roomID);
  };
}
