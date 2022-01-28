import { Socket, Server } from 'socket.io';
import { Game } from '@cah-game/game';
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
};

describe('Room', () => {
  let server: MockServer = new MockServer();
  const gameSpy: GameSpy = {
    startRound: jest.spyOn(Game.prototype, 'startRound'),
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
      const socket = new MockSocket() as unknown as Socket;
      const user = new User('user', socket);
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
      const socket = new MockSocket() as unknown as Socket;
      const user = new User('user', socket);
      const room = new Room(
        user,
        server as unknown as Server,
        new CardService(),
      );

      expect(() => room.addUser(user, false)).toThrowError(UserExistsError);
    });

    it('Should add a user, make user join room socket, and emit events', () => {
      const socket = new MockSocket() as unknown as Socket;
      const socket2 = new MockSocket() as unknown as Socket;
      const user = new User('user', socket);
      const user2 = new User('user2', socket2);
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
      const socket = new MockSocket() as unknown as Socket;
      const user = new User('user', socket);
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
      const socket = new MockSocket() as unknown as Socket;
      const socket2 = new MockSocket() as unknown as Socket;
      const user = new User('user', socket);
      const user2 = new User('user2', socket2);
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
      const socket = new MockSocket() as unknown as Socket;
      const socket2 = new MockSocket() as unknown as Socket;
      const user = new User('user', socket);
      const user2 = new User('user2', socket2);
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
    it.todo('Should update game config and emit event on socket CONFIG_UPDATE');

    it.todo(
      'Should return an exception when trying to start game as not the owner',
    );

    it('Should call game.startGame on socket START_GAME', () => {
      const socket = new MockSocket();
      const socket2 = new MockSocket();
      const user = new User('user', socket as unknown as Socket);
      const user2 = new User('user2', socket2 as unknown as Socket);
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

    it.todo(
      'Should emit internal USER_LEAVE event when socket receives USER_LEAVE',
    );
  });

  describe('incoming game events', () => {});

  describe('outgoing game events', () => {});
});
