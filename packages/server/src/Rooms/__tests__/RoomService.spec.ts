import { Server, Socket } from 'socket.io';
import { RoomService } from '../RoomService';
import { CardService } from '../../Cards/CardService';
import { User } from '../../User/User';
import { MockSocket } from '../../../test/MockSocket';
import { MockServer } from '../../../test/MockServer';
import { UserInRoomError } from '../Errors/UserInRoomError';
import { RoomNotFoundError } from '../Errors/RoomNotFoundError';

describe('RoomService', () => {
  let roomService: RoomService;
  let server: MockServer;

  beforeEach(() => {
    server = new MockServer();
    roomService = new RoomService(new CardService());
  });

  afterEach(() => {
    server.__clear();
  });

  describe('createRoom', () => {
    it('Should create a room with valid user details', () => {
      const user = new User('user', new MockSocket() as unknown as Socket);
      const room = roomService.createRoom(user, server as unknown as Server);

      expect(room).toBeDefined();
      expect(room.roomID).toEqual(expect.any(String));
    });

    it('Should throw an error when user is already in a room', () => {
      const user = new User('user', new MockSocket() as unknown as Socket);

      roomService.createRoom(user, server as unknown as Server);
      expect(() =>
        roomService.createRoom(user, server as unknown as Server),
      ).toThrowError(UserInRoomError);
    });
  });

  describe('listRooms', () => {
    it('Should list all available rooms', () => {
      const user = new User('user', new MockSocket() as unknown as Socket);
      const room = roomService.createRoom(user, server as unknown as Server);
      const list = roomService.listRooms();

      expect(list).toStrictEqual([room]);
    });
  });

  describe('getRoom', () => {
    it('Should return a specified room', () => {
      const user = new User('user', new MockSocket() as unknown as Socket);
      const room = roomService.createRoom(user, server as unknown as Server);
      const requestedRoom = roomService.getRoom(room.roomID);

      expect(requestedRoom).toStrictEqual(room);
    });

    it('Should return undefined when room cannot be found', () => {
      const user = new User('user', new MockSocket() as unknown as Socket);

      roomService.createRoom(user, server as unknown as Server);

      const requestedRoom = roomService.getRoom('bad-id');

      expect(requestedRoom).toBeUndefined();
    });
  });

  describe('getRoomByUserID', () => {
    it('Should return a specified room', () => {
      const user = new User('user', new MockSocket() as unknown as Socket);
      const room = roomService.createRoom(user, server as unknown as Server);
      const requestedRoom = roomService.getRoomByUserID(user.id);

      expect(requestedRoom).toStrictEqual(room);
    });

    it('Should return undefined when room cannot be found', () => {
      const user = new User('user', new MockSocket() as unknown as Socket);

      roomService.createRoom(user, server as unknown as Server);

      const requestedRoom = roomService.getRoomByUserID('bad-id');

      expect(requestedRoom).toBeUndefined();
    });
  });

  describe('addUser', () => {
    it('Should add a user to a given room', () => {
      const user = new User('user', new MockSocket() as unknown as Socket);
      const user2 = new User('user2', new MockSocket() as unknown as Socket);
      const room = roomService.createRoom(user, server as unknown as Server);

      server.__addSockets([
        user.socket as unknown as MockSocket,
        user2.socket as unknown as MockSocket,
      ]);
      roomService.addUser(user2, room.roomID, false);

      const requestedRoom = roomService.getRoomByUserID(user2.id);

      expect(requestedRoom).toStrictEqual(room);
    });

    it('Should throw an error when room cannot be found', () => {
      const user = new User('user', new MockSocket() as unknown as Socket);

      expect(() => roomService.addUser(user, 'bad-id', false)).toThrowError(
        RoomNotFoundError,
      );
    });

    it('Should throw an error when user is already in a room', () => {
      const user = new User('user', new MockSocket() as unknown as Socket);
      const room = roomService.createRoom(user, server as unknown as Server);

      expect(() => roomService.addUser(user, room.roomID, false)).toThrowError(
        UserInRoomError,
      );
    });
  });

  describe('removeUser', () => {
    it('Should remove a user from a given room when using only a userID', () => {
      const user = new User('user', new MockSocket() as unknown as Socket);
      const user2 = new User('user2', new MockSocket() as unknown as Socket);
      const room = roomService.createRoom(user, server as unknown as Server);

      server.__addSockets([
        user.socket as unknown as MockSocket,
        user2.socket as unknown as MockSocket,
      ]);
      roomService.addUser(user2, room.roomID, false);
      roomService.removeUser({ userID: user2.id });

      const requestedRoom = roomService.getRoom(room.roomID);

      expect(requestedRoom).toStrictEqual(room);
    });

    it('Should remove a user from a given room when using userID and roomID', () => {
      () => {
        const user = new User('user', new MockSocket() as unknown as Socket);
        const user2 = new User('user2', new MockSocket() as unknown as Socket);
        const room = roomService.createRoom(user, server as unknown as Server);

        server.__addSockets([
          user.socket as unknown as MockSocket,
          user2.socket as unknown as MockSocket,
        ]);
        roomService.addUser(user2, room.roomID, false);
        roomService.removeUser({ userID: user2.id, roomID: room.roomID });

        const requestedRoom = roomService.getRoom(room.roomID);

        expect(requestedRoom).toStrictEqual(room);
      };
    });
  });

  describe('room events', () => {
    it.todo('Should destroy a room when receiving a ROOM_CLOSE internal event');
    it.todo('Should remove a user when receiving USER_LEAVE internal event');
  });
});
