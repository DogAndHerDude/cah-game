import { WsResponse } from '@nestjs/websockets';
import { IRoomDetails } from '@/Room/IRoomDetails';
import { RoomGatewayEvents } from '../RoomGatewayEvents';
import { Room } from '../../Room/Room';

export class WsJoinRoomResponse implements WsResponse<IRoomDetails> {
  public readonly event: string = RoomGatewayEvents.ROOM_JOINED;
  public readonly data: IRoomDetails;

  constructor(room: Room) {
    this.data = room.getRoomDetails();
  }
}
