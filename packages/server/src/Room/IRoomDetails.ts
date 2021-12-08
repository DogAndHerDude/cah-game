import { DefaultGameConfig } from '../../../game/DefaultGameConfig';
import { IGameDetails } from '../../../game/IGameDetails';
import { IPlainRoomUser } from './RoomUser';

export interface IRoomDetails extends Partial<IGameDetails> {
  roomID: string;
  config: DefaultGameConfig;
  logs: Array<string>;
  users: Array<IPlainRoomUser>;
}
