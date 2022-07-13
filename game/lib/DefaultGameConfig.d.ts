import { IGameConfig } from "./IGameConfig";
export declare class DefaultGameConfig implements IGameConfig {
    roundTimer: number;
    pickTimer: number;
    maxPoints: number;
    packs: any[];
    maxPlayers: number;
    constructor(roundTimer?: number, pickTimer?: number, maxPoints?: number, packs?: any[], maxPlayers?: number);
}
