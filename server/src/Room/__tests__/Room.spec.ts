import { Socket, Server } from 'socket.io';
import { Game, DefaultGameConfig, GameEvents } from '@cah-game/game';
import { Room } from '../Room';
import { RoomUser } from '../RoomUser';
import { User } from '../../User/User';
import { MockServer } from '../../../test/MockServer';
import { MockSocket } from '../../../test/MockSocket';
import { CardService } from '../../Cards/CardService';
import { UserExistsError } from '../errors/UserExistsError';
import { InternalRoomEvents, PublicRoomEvents } from '../RoomEvents';

type GameSpy = {
  startRound: jest.SpyInstance<ReturnType<Game['startRound']>, []>;
  playCard: jest.SpyInstance<ReturnType<Game['playCard']>, [string, string]>;
  pickCard: jest.SpyInstance<ReturnType<Game['pickCard']>, [string, string]>;
};

describe('Room', () => {
  let server: MockServer = new MockServer();
  const gameSpy: GameSpy = {
    startRound: jest.spyOn(Game.prototype, 'startRound'),
    playCard: jest.spyOn(Game.prototype, 'playCard'),
    pickCard: jest.spyOn(Game.prototype, 'pickCard'),
  };

  afterEach(() => {
    server.__clear();
    Object.keys(server).forEach((key) => {
      server[key]?.mockClear && server[key].mockClear();
    });
    Object.keys(gameSpy).forEach((key) => gameSpy[key].mockClear());
  });

  describe('constructor', () => {
    it('Should create a room with ID, and make the owner join the room socket', () => {
      const socket = new MockSocket() as unknown as Socket;
      const user = new User('user', socket);
      const roomUser = new RoomUser(user, false);
      const room = new Room(
        user,
        server as unknown as Server,
        new CardService(),
      );

      expect(socket.join).toHaveBeenCalled();
      expect(room['roomOwner']).toStrictEqual(roomUser);
      expect(room['users']).toStrictEqual([roomUser]);
    });
  });

  describe('listUsers', () => {
    it('Should list all users', () => {
      const socket = new MockSocket();
      const user = new User('user', socket.__asSocket());
      const roomUser = new RoomUser(user, false);
      const room = new Room(
        user,
        server as unknown as Server,
        new CardService(),
      );

      expect(room.listUsers()).toStrictEqual([roomUser]);
    });
  });

  describe('addUser', () => {
    it('Should throw an error when user already exists', () => {
      const socket = new MockSocket();
      const user = new User('user', socket.__asSocket());
      const room = new Room(
        user,
        server as unknown as Server,
        new CardService(),
      );

      expect(() => room.addUser(user, false)).toThrowError(UserExistsError);
    });

    it('Should add a user, make user join room socket, and emit events', () => {
      const socket = new MockSocket();
      const socket2 = new MockSocket();
      const user = new User('user', socket.__asSocket());
      const user2 = new User('user2', socket2.__asSocket());
      const room = new Room(
        user,
        server as unknown as Server,
        new CardService(),
      );

      room.addUser(user2, false);

      expect(room.listUsers()).toStrictEqual([
        new RoomUser(user, false),
        new RoomUser(user2, false),
      ]);
      expect(server.in).toHaveBeenCalledWith(room.roomID);
      expect(server.emit).toHaveBeenCalledWith(PublicRoomEvents.NEW_USER, {
        userID: user2.id,
        name: user2.name,
      });
    });
  });

  describe('removeUser', () => {
    it('Should remove the only user, and leave socket and emit ROOM_CLOSE event', () => {
      const socket = new MockSocket();
      const user = new User('user', socket.__asSocket());
      const room = new Room(
        user,
        server as unknown as Server,
        new CardService(),
      );
      const emitSpyInstance = jest.spyOn(room, 'emit');

      room.removeUser(user.id);
      expect(socket.leave).toHaveBeenCalledWith(room.roomID);
      expect(room['users']).toHaveLength(0);
      expect(emitSpyInstance).toHaveBeenCalledWith(
        InternalRoomEvents.ROOM_CLOSED,
        room.roomID,
      );
    });

    it('Should remove owner and replace the owner wit.todoh the next user', () => {
      const socket = new MockSocket();
      const socket2 = new MockSocket();
      const user = new User('user', socket.__asSocket());
      const user2 = new User('user2', socket2.__asSocket());
      const roomUser = new RoomUser(user2, false);
      const room = new Room(
        user,
        server as unknown as Server,
        new CardService(),
      );

      room.addUser(user2, false);
      room.removeUser(user.id);

      expect(room['roomOwner']).toStrictEqual(roomUser);
      expect(room.listUsers()).toStrictEqual([roomUser]);
    });

    it('Should call game.removePlayer if game is in progress', () => {
      const socket = new MockSocket();
      const socket2 = new MockSocket();
      const user = new User('user', socket.__asSocket());
      const user2 = new User('user2', socket2.__asSocket());
      const room = new Room(
        user,
        server as unknown as Server,
        new CardService(),
      );

      room.addUser(user2, false);
      room['game'] = { removePlayer: jest.fn() } as unknown as Game;
      room.removeUser(user2.id);

      expect(room['game'].removePlayer).toHaveBeenCalledWith(user2.id);
    });
  });

  describe('getBasicRoomDetails', () => {
    it.todo('Should return basic room details when game is not in progress');
    it.todo(
      'Should return basic room details with the game summary when the game is in progress',
    );
  });

  describe('getRoomDetails', () => {
    it.todo('Should return room details when game is not in progress');
    it.todo(
      'Should return room details with the game details when the game is in progress',
    );
  });

  describe('incoming room events', () => {
    it('Should not change game config if user is not the owner of room', () => {
      const socket = new MockSocket();
      const user = new User('user', socket.__asSocket());
      const room = new Room(
        user,
        server as unknown as Server,
        new CardService(),
      );

      socket.__emitToSelf(PublicRoomEvents.CONFIG_UPDATE, {
        packs: [0, 1],
      });
      expect(socket.to).toHaveBeenCalledWith(room.roomID);
      expect(socket.emit).toHaveBeenCalledWith('exception', 'Unauthorized');
    });

    it('Should update game config and emit event on socket CONFIG_UPDATE', () => {
      const socket = new MockSocket();
      const user = new User('user', socket.__asSocket());
      const room = new Room(
        user,
        server as unknown as Server,
        new CardService(),
      );

      socket.decoded.id = user.id;
      socket.__emitToSelf(PublicRoomEvents.CONFIG_UPDATE, {
        packs: [0, 1],
      });
      expect(server.in).toHaveBeenCalledWith(room.roomID);
      expect(server.emit).toHaveBeenCalledWith(PublicRoomEvents.CONFIG_UPDATE, {
        ...new DefaultGameConfig(),
        packs: [0, 1],
      });
    });

    it('Should return an exception when trying to start game as not the owner', () => {
      const socket = new MockSocket();
      const user = new User('user', socket.__asSocket());
      const room = new Room(
        user,
        server as unknown as Server,
        new CardService(),
      );

      socket.__emitToSelf(PublicRoomEvents.START_GAME);
      expect(socket.to).toHaveBeenCalledWith(room.roomID);
      expect(socket.emit).toHaveBeenCalledWith('exception', 'Unauthorized');
    });

    it('Should call game.startGame on socket START_GAME', () => {
      const socket = new MockSocket();
      const socket2 = new MockSocket();
      const user = new User('user', socket.__asSocket());
      const user2 = new User('user2', socket2.__asSocket());
      const room = new Room(
        user,
        server as unknown as Server,
        new CardService(),
      );

      socket.decoded.id = user.id;

      room.addUser(user2, false);
      socket.__emitToSelf(PublicRoomEvents.START_GAME);
      expect(room['game']).toBeInstanceOf(Game);
      expect(gameSpy.startRound).toHaveBeenCalled();
      room['game'].endGame();
    });

    it('Should emit internal USER_LEAVE event when socket receives USER_LEAVE', async () => {
      const socket = new MockSocket();
      const user = new User('user', socket.__asSocket());
      const room = new Room(
        user,
        server as unknown as Server,
        new CardService(),
      );
      const promisifiedOn: Promise<{ userID: string; roomID: string }> =
        new Promise((resolve) =>
          room.on(InternalRoomEvents.USER_LEAVE, (args) => resolve(args)),
        );
      socket.decoded.id = user.id;

      socket.__emitToSelf(PublicRoomEvents.USER_LEAVE);

      const leaveEventData = await promisifiedOn;

      expect(leaveEventData).toStrictEqual({
        userID: user.id,
        roomID: room.roomID,
      });
    });
  });

  describe('incoming game events', () => {
    it('Should call game.playCard when receiving card played message', () => {
      const socket = new MockSocket();
      const socket2 = new MockSocket();
      const user = new User('user', socket.__asSocket());
      const user2 = new User('user2', socket2.__asSocket());
      const room = new Room(
        user,
        server as unknown as Server,
        new CardService(),
      );
      socket.decoded.id = user.id;
      socket2.decoded.id = user2.id;

      room.addUser(user2, false);
      socket.__emitToSelf(PublicRoomEvents.START_GAME);

      const cardInPlay = room['game']
        .getPlayers()
        .find((player) => player.id === user2.id)
        .getCards()[0];

      socket2.__emitToSelf(GameEvents.PLAYER_CARD_PLAYED, {
        card: cardInPlay.text,
      });
      expect(gameSpy.playCard).toHaveBeenCalledWith(user2.id, cardInPlay.text);
      room['game'].endGame();
    });

    it('Should emit an error when an error is thrown by game.playCard', () => {
      const socket = new MockSocket();
      const socket2 = new MockSocket();
      const user = new User('user', socket.__asSocket());
      const user2 = new User('user2', socket2.__asSocket());
      const room = new Room(
        user,
        server as unknown as Server,
        new CardService(),
      );
      socket.decoded.id = user.id;
      socket2.decoded.id = user2.id;

      room.addUser(user2, false);
      gameSpy.playCard.mockImplementationOnce(() => {
        throw new Error('error');
      });
      socket.__emitToSelf(PublicRoomEvents.START_GAME);
      socket2.__emitToSelf(GameEvents.PLAYER_CARD_PLAYED, {
        card: 'card',
      });
      expect(socket2.to).toHaveBeenCalledWith(room.roomID);
      expect(socket2.emit).toHaveBeenLastCalledWith('exception', 'error');
      room['game'].endGame();
    });

    it('Should call game.pickCard when player picks card', () => {
      const socket = new MockSocket();
      const socket2 = new MockSocket();
      const user = new User('user', socket.__asSocket());
      const user2 = new User('user2', socket2.__asSocket());
      const room = new Room(
        user,
        server as unknown as Server,
        new CardService(),
      );
      socket.decoded.id = user.id;
      socket2.decoded.id = user2.id;

      room.addUser(user2, false);
      socket.__emitToSelf(PublicRoomEvents.START_GAME);
      socket.__emitToSelf(GameEvents.PLAYED_CARD_PICK, {
        card: 'card',
      });
      expect(gameSpy.pickCard).toHaveBeenCalledWith(user.id, 'card');
      room['game'].endGame();
    });
  });

  describe('outgoing game events', () => {
    it('Should call socket emit when emitting HAND_OUT_CARDDS', () => {
      const socket = new MockSocket();
      const user = new User('user', socket.__asSocket());
      const room = new Room(
        user,
        server as unknown as Server,
        new CardService(),
      );
      room['game'] = {
        events: new Map(),
        on(event, callback) {
          this.events.set(event, callback);
        },
        emit(event, data) {
          this.events.get(event)(data);
        },
      } as unknown as Game;

      room['handleOutgoingGameEvents']();
      room['game'].emit(GameEvents.HAND_OUT_CARDS, {
        [user.id]: [{ key: 'value' }],
      });
      expect(socket.to).toHaveBeenLastCalledWith(room.roomID);
      expect(socket.emit).toHaveBeenCalledWith(GameEvents.HAND_OUT_CARDS, {
        whiteCards: [{ key: 'value' }],
      });
    });

    it.each([
      {
        event: GameEvents.GAME_STARTED,
      },
      {
        event: GameEvents.ROUND_STARTED,
        data: { key: 'value' },
      },
      {
        event: GameEvents.PLAYER_CARD_PLAYED,
        data: { key: 'value' },
      },
      {
        event: GameEvents.PLAY_ENDED,
        data: { key: 'value' },
      },
      {
        event: GameEvents.PICK_STARTED,
        data: { key: 'value' },
      },
      {
        event: GameEvents.PICK_ENDED,
        data: { key: 'value' },
      },
      {
        event: GameEvents.ROUND_ENDED,
        data: { key: 'value' },
      },
      {
        event: GameEvents.GAME_ENDED,
        data: { key: 'value' },
      },
    ])('Should emit all GameEvents with the given data', (testData) => {
      const socket = new MockSocket();
      const user = new User('user', socket.__asSocket());
      const room = new Room(
        user,
        server as unknown as Server,
        new CardService(),
      );
      room['game'] = {
        events: new Map(),
        on(event, callback) {
          this.events.set(event, callback);
        },
        emit(event, data) {
          this.events.get(event)(data);
        },
      } as unknown as Game;

      room['handleOutgoingGameEvents']();

      if (testData.data) {
        room['game'].emit(testData.event, testData.data);
      } else {
        room['game'].emit(testData.event);
      }

      expect(server.in).toHaveBeenLastCalledWith(room.roomID);

      if (testData.data) {
        expect(server.emit).toHaveBeenLastCalledWith(
          testData.event,
          testData.data,
        );
      } else {
        expect(server.emit).toHaveBeenLastCalledWith(testData.event);
      }
    });
  });
});
