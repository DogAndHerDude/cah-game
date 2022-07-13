import { DefaultGameConfig, IGameDetails } from '@cah-game/game';
import { IPlainRoomUser } from './RoomUser';

export interface IRoomDetails extends Partial<IGameDetails> {
  roomID: string;
  config: DefaultGameConfig;
  logs: Array<string>;
  users: Array<IPlainRoomUser>;
}
