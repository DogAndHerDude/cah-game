import { IGameConfig, IGameSummary } from '@cah-game/game';

export interface IBasicRoomDetails
  extends Partial<IGameSummary>,
    Pick<IGameConfig, 'maxPlayers'> {
  inProgress: boolean;
  goal: number;
  users?: number;
}
