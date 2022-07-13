import { Game, GameEvents } from "..";
import { IGameConfig } from "../IGameConfig";
import { Player } from "../Player";
export interface IGameEventStashItem {
    event: GameEvents;
    data: any;
}
export declare type GameRunnerCallback = (data: any, players: Array<Player>, events: Array<IGameEventStashItem>) => void;
export declare class GameRunner {
    private readonly gameTimeout;
    static config: IGameConfig;
    events: Array<IGameEventStashItem>;
    game: Game;
    private originalTimerBetweenRounds;
    private playerStash;
    constructor(players: Array<Player>, gameTimeout?: number);
    play(): Promise<Array<IGameEventStashItem>>;
    onRoundStarted(cb: GameRunnerCallback): void;
    onPickStarted(cb: GameRunnerCallback): void;
    private listenEvents;
    private onEvent;
}
