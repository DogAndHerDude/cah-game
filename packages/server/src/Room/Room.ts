import { EventEmitter } from 'events';
import { time } from 'uniqid';
import { Server, Socket } from 'socket.io';
import {
  Game,
  DefaultGameConfig,
  GameEvents,
  IGameConfig,
  Player,
  GameDeck,
} from '@cah-game/game';
import { User } from '../User/User';
import { RoomUser } from './RoomUser';
import { CardService } from '../Cards/CardService';
import { RoomEvents } from './RoomEvents';
import { IBasicRoomDetails } from './IRoomBasicDetails';
import { IRoomDetails } from './IRoomDetails';

export class Room extends EventEmitter {
  public static MAX_CARDS = 6;

  public readonly roomID: string = `room-${time()}`;
  private readonly users: Array<RoomUser> = [];
  private roomOwner: RoomUser;
  private game: Game | null = null;
  private gameConfig: IGameConfig = new DefaultGameConfig();

  constructor(
    user: User,
    private readonly socketServer: Server,
    private readonly cardService: CardService,
  ) {
    super();
    this.roomOwner = new RoomUser(user, false, user.socket);
    user.socket.join(this.roomID);
    this.users.push(this.roomOwner);
    this.handleIncomingRoomEvents(user.socket);
  }

  public listUsers(): Array<RoomUser> {
    return this.users;
  }

  public addUser(user: User, spectator: boolean): void {
    if (!this.roomOwner) {
      this.roomOwner = new RoomUser(user, false, user.socket);
      user.socket.join(this.roomID);
      // socket = socket.join(this.roomID);
      this.users.push(this.roomOwner);
      this.handleIncomingRoomEvents(user.socket);
      return;
    }

    if (this.userExists(user.id)) {
      // throw error users already exists
    }

    user.socket.join(this.roomID);
    this.users.push(new RoomUser(user, spectator, user.socket));
    this.socketServer.in(this.roomID).emit(RoomEvents.NEW_USER, {
      userID: user.id,
      name: user.name,
    });
    this.socketServer.to(user.socket.id).emit(RoomEvents.CONFIG_UPDATE, {
      gameConfig: this.gameConfig,
    });
  }

  public removeUser(userID: string): void {
    if (this.users.length === 1) {
      // Cleanup socket listeners
      // Destroy room
      this.emit(RoomEvents.CLOSE_ROOM, this.roomID);
    }

    if (userID === this.roomOwner.user.id) {
      const currentOwnerIndex = this.users.findIndex(
        ({ user }) => user.id === userID,
      );
      const nextOwnerIndex = currentOwnerIndex + 1;
      this.roomOwner = this.users[nextOwnerIndex] ?? this.users[0];
      // TODO: Notify of the new owner
    }

    if (this.game) {
      this.game.removePlayer(userID);
      // notify -1 player
    }

    this.users.filter((user) => {
      if (user.user.id !== userID) {
        return true;
      }

      user.socket.leave(`room-${this.roomID}`);
      return false;
    });
  }

  public getBasicRoomDetails(): IBasicRoomDetails {
    if (!this.game) {
      return {
        inProgress: false,
        users: this.users.length,
        goal: this.gameConfig.maxPoints,
        maxPlayers: this.gameConfig.maxPlayers,
      };
    }

    // Show game data such as players score and config
    return {
      inProgress: true,
      goal: this.gameConfig.maxPoints,
      maxPlayers: this.gameConfig.maxPlayers,
      ...this.game.getGameSummary(),
    };
  }

  public getRoomDetails(): IRoomDetails {
    const baseDetails = {
      roomID: this.roomID,
      config: this.gameConfig,
      logs: [], // Will be implemented one day
      users: this.users.map((user) => user.toPlain()),
    };

    if (!this.game) {
      return baseDetails;
    }

    return {
      ...baseDetails,
      ...this.game.getGameDetails(),
    };
  }

  private updateConfig(key: keyof IGameConfig, value: any): void {
    if (key in this.gameConfig) {
      this.gameConfig[key] = value;
    }
  }

  private startGame(): void {
    if (this.game) {
      // TODO: throw error that the game has started
    }

    this.game = new Game(
      this.users.map((user) => new Player(user.user.id)),
      this.gameConfig,
      new GameDeck(this.cardService.getDeck(this.gameConfig.packs)),
    );
    this.handleOutgoingGameEvents();
    this.users.forEach((user) => this.handleIncomingGameEvents(user.socket));
    this.game.startRound();
  }

  private userExists(id: string): boolean {
    return !!this.users.find(({ user }) => user.id === id);
  }

  private handleIncomingRoomEvents(socket: Socket): void {
    socket.on(
      RoomEvents.CONFIG_UPDATE,
      (data: Record<keyof IGameConfig, any>) => {
        // validate if owner
        Object.keys(data).forEach((key) =>
          this.updateConfig(
            key as keyof IGameConfig,
            data[key as keyof IGameConfig],
          ),
        );
        this.socketServer
          .in(this.roomID)
          .emit(RoomEvents.CONFIG_UPDATE, this.gameConfig);
      },
    );
    socket.on(RoomEvents.START_GAME, () => {
      // validate if owner
      // handle thrown error with error response
      this.startGame();
    });
  }

  private handleIncomingGameEvents(socket: Socket): void {
    socket.on(GameEvents.PLAYER_CARD_PLAYED, (data) => {
      if (this.game) {
        this.game.playCard(data.userID, data.card);
      }
    });
    socket.on(GameEvents.PLAYED_CARD_PICK, (data) => {
      if (this.game) {
        this.game.playCard(data.userID, data.card);
      }
    });
  }

  private handleOutgoingGameEvents(): void {
    if (!this.game) {
      return;
    }

    this.game.on(GameEvents.GAME_STARTED, () =>
      this.socketServer.in(this.roomID).emit(GameEvents.GAME_STARTED),
    );
    this.game.on(GameEvents.HAND_OUT_CARDS, (data) =>
      Object.entries(data).forEach(([userID, whiteCards]) => {
        const user = this.users.find((roomUser) => roomUser.user.id === userID);

        if (!user) {
          return;
        }

        user.socket
          .to(user.socket.id)
          .emit(GameEvents.HAND_OUT_CARDS, { whiteCards });
      }),
    );
    this.game.on(GameEvents.ROUND_STARTED, (data) =>
      this.socketServer.in(this.roomID).emit(GameEvents.ROUND_STARTED, data),
    );
    this.game.on(GameEvents.PLAYER_CARD_PLAYED, (data) =>
      this.socketServer
        .in(this.roomID)
        .emit(GameEvents.PLAYER_CARD_PLAYED, data),
    );
    this.game.on(GameEvents.PLAY_ENDED, (data) =>
      this.socketServer.in(this.roomID).emit(GameEvents.PLAY_ENDED, data),
    );
    this.game.on(GameEvents.PICK_STARTED, (data) =>
      this.socketServer.in(this.roomID).emit(GameEvents.PICK_STARTED, data),
    );
    this.game.on(GameEvents.PICK_ENDED, (data) =>
      this.socketServer.in(this.roomID).emit(GameEvents.PICK_ENDED, data),
    );
    this.game.on(GameEvents.ROUND_ENDED, (data) =>
      this.socketServer.in(this.roomID).emit(GameEvents.ROUND_ENDED, data),
    );
    this.game.on(GameEvents.GAME_ENDED, (data) =>
      this.socketServer.in(this.roomID).emit(GameEvents.GAME_ENDED, data),
    );
  }
}
