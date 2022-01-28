import { CardService, Game, GameDeck, GameEvents } from "..";
import { IGameConfig } from "../IGameConfig";
import { Player } from "../Player";

export interface IGameEventStashItem {
  event: GameEvents;
  data: any;
}

export type GameRunnerCallback = (
  data: any,
  players: Array<Player>,
  events: Array<IGameEventStashItem>
) => void;

export class GameRunner {
  public static config: IGameConfig = {
    pickTimer: 100,
    roundTimer: 100,
    maxPoints: 2,
    packs: [0],
    maxPlayers: 6,
  };
  public events: Array<IGameEventStashItem> = [];
  public game: Game;
  private originalTimerBetweenRounds: number;
  private playerStash: Array<Player>;

  constructor(
    players: Array<Player>,
    private readonly gameTimeout: number = 1000
  ) {
    const cardService = new CardService();
    const deck = new GameDeck(cardService.getDeck(GameRunner.config.packs));
    this.playerStash = players;
    this.game = new Game(players, GameRunner.config, deck);
    this.originalTimerBetweenRounds = (Game as any).TIMER_BETWEEN_ROUNDS;
    (Game as any).TIMER_BETWEEN_ROUNDS = 1;

    this.listenEvents();
  }

  public async play(): Promise<Array<IGameEventStashItem>> {
    // Validate if in progress already
    return new Promise((resolve, reject) => {
      let timeout: NodeJS.Timer;
      this.game.startRound();
      this.game.on(GameEvents.GAME_ENDED, () => {
        (Game as any).TIMER_BETWEEN_ROUNDS = this.originalTimerBetweenRounds;
        clearTimeout(timeout);
        resolve(this.events);
      });
      timeout = setTimeout(() => {
        (Game as any).TIMER_BETWEEN_ROUNDS = this.originalTimerBetweenRounds;
        reject(new Error(`GameRunner timed out after ${this.gameTimeout}ms`));
      }, this.gameTimeout);
    });
  }

  public onRoundStarted(cb: GameRunnerCallback): void {
    this.game.on(GameEvents.ROUND_STARTED, (data) => {
      cb(data, this.playerStash, this.events);
    });
  }

  public onPickStarted(cb: GameRunnerCallback): void {
    this.game.on(GameEvents.PICK_STARTED, (data) => {
      cb(data, this.playerStash, this.events);
    });
  }

  private listenEvents(): void {
    Object.keys(GameEvents).forEach((event) =>
      this.onEvent(event as GameEvents)
    );
  }

  private onEvent(event: GameEvents): void {
    this.game.on(event, (data) => {
      this.events.push({
        event,
        data,
      });
    });
  }
}
