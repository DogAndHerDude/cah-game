import { IGameConfig } from './IGameConfig';

export class DefaultGameConfig implements IGameConfig {
  constructor(
    public readonly roundTimer = 60000,
    public readonly pickTimer = 60000,
    public readonly maxPoints = 12,
    public readonly packs = [0],
    public readonly maxPlayers = 12,
    public readonly maxCards = 6,
  ) {}
}
