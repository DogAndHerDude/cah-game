import { WsResponse } from '@nestjs/websockets';
import { RoomGatewayEvents } from '../RoomGatewayEvents';
import { Room } from '../../Room/Room';
import { IRoomDetails } from 'server/src/Room/IRoomDetails';

export class WsJoinRoomResponse implements WsResponse<IRoomDetails> {
  public readonly event: string = RoomGatewayEvents.ROOM_JOINED;
  public readonly data: IRoomDetails;

  constructor(room: Room) {
    this.data = room.getRoomDetails();
  }
}
