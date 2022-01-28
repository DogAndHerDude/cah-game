import { WsResponse } from '@nestjs/websockets';
import { RoomGatewayEvents } from '../RoomGatewayEvents';
import { Room } from '../../Room/Room';
import { IRoomDetails } from '../../Room/IRoomDetails';

export class WsCreateRoomResponse implements WsResponse<IRoomDetails> {
  public readonly event: string = RoomGatewayEvents.ROOM_CREATED;
  public readonly data: IRoomDetails;

  constructor(room: Room) {
    const roomDetails = room.getRoomDetails();

    this.data = {
      ...roomDetails,
      config: { ...roomDetails.config },
    };
  }
}
