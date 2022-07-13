import { IGameConfig } from "./IGameConfig";

export class DefaultGameConfig implements IGameConfig {
  constructor(
    public roundTimer = 60000,
    public pickTimer = 60000,
    public maxPoints = 12,
    public packs = [],
    public maxPlayers = 12
  ) {}
}
