import { WsResponse } from '@nestjs/websockets';
import { RoomGatewayEvents } from '../RoomGatewayEvents';
import { Room } from '../../Room/Room';
import { IBasicRoomDetails } from 'server/src/Room/IRoomBasicDetails';

export type ListRoomsResponse = Array<{
  roomID: string;
  details: IBasicRoomDetails;
}>;

export class WsResponseListRooms implements WsResponse<ListRoomsResponse> {
  public readonly event: string = RoomGatewayEvents.LIST_ROOMS;
  public readonly data: ListRoomsResponse;

  constructor(rooms: Array<Room>) {
    this.data = rooms.map((room) => {
      return {
        roomID: room.roomID,
        details: room.getBasicRoomDetails(),
      };
    });
  }
}
