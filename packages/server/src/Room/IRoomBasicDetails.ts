import { IGameConfig } from '../../../game/IGameConfig';
import { IGameSummary } from '../../../game/IGameSummary';

export interface IBasicRoomDetails
  extends Partial<IGameSummary>,
    Pick<IGameConfig, 'maxPlayers'> {
  inProgress: boolean;
  goal: number;
  users?: number;
}
