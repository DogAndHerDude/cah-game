import { Server, Socket } from 'socket.io';
import { RoomService } from '../RoomService';
import { CardService } from '../../Cards/CardService';
import { User } from '../../User/User';
import { MockSocket } from '../../../test/MockSocket';

describe('RoomService', () => {
  let roomService: RoomService;
  let server: Server;

  beforeEach(() => {
    server = new Server();
    roomService = new RoomService(new CardService());

    server.listen(3000);
  });

  afterEach(() => {
    server.close();
  });

  describe('createRoom', () => {
    it('Should create a room with valid user details', () => {
      const user = new User('user', new MockSocket() as unknown as Socket);
      const room = roomService.createRoom(user, server);
    });
    it.todo('Shoudl throw an error when user is already in a room');
  });

  describe('listRooms', () => {
    it.todo('Should list all available rooms');
  });

  describe('getRoom', () => {
    it.todo('Should return a specified room');
    it.todo('Should return undefined when room cannot be found');
  });

  describe('getRoomByUserID', () => {
    it.todo('Should return a specified room');
    it.todo('Should return undefined when room cannot be found');
  });

  describe('removeRoom', () => {
    it.todo('Should remove room wit.todoh a given id');
  });

  describe('addUser', () => {
    it.todo('Should add a user to a given room');
    it.todo('Should throw an error when room cannot be found');
    it.todo('Should throw an error when user is already in a room');
  });

  describe('removeUser', () => {
    it.todo('Should remove a user from a given room');
  });

  describe('room events', () => {
    it.todo('Should destroy a room when receiving a ROOM_CLOSE internal event');
    it.todo('Should remove a user when receiving USER_LEAVE internal event');
  });
});
