/// <reference types="node" />
import { EventEmitter } from "events";
import { GameDeck } from "./GameDeck";
import { Player } from "./Player";
import { IGameConfig } from "./IGameConfig";
import { IGameSummary } from "./IGameSummary";
import { IGameDetails } from "./IGameDetails";
export declare class Game extends EventEmitter {
    private players;
    private readonly config;
    private deck;
    private static readonly TIMER_BETWEEN_ROUNDS;
    private static readonly MAX_CARDS;
    private static readonly MIN_PLAYERS;
    private cardCzar?;
    private nextCzar?;
    private startTimer?;
    private roundTimer?;
    private pickTimer?;
    private round;
    constructor(players: Array<Player>, config: IGameConfig, deck: GameDeck);
    getGameSummary(): IGameSummary;
    getGameDetails(): IGameDetails;
    getPlayers(): Array<Player>;
    getRound(): number;
    getCardCar(): string | undefined;
    getNextCardCzar(): string | undefined;
    removePlayer(playerID: string): void;
    playCard(playerID: string, card: string): void;
    pickCard(playerID: string, card: string): void;
    startRound(): void;
    private pickCardCzar;
    private prepareNextCardCzar;
    private handOutCards;
    private endPlay;
    private startPickTimer;
    private endPick;
    private endRoundPrematurely;
    private postRoundHandler;
    endGame(reason?: string): void;
    private cleanupTimers;
    private playerReachedMaxPoints;
    private allPlayersPlayedCards;
    private emitEvent;
}