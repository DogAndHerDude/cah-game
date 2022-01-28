import { RoomService } from '../RoomService';
import { CardService } from '../../Cards/CardService';

describe('RoomService', () => {
  let roomService: RoomService;

  beforeEach(() => {
    roomService = new RoomService(new CardService());
  });

  describe('createRoom', () => {
    it('Should create a room with valid user details', () => {});
    it('Shoudl throw an error when user is already in a room', () => {});
  });

  describe('listRooms', () => {
    it('Should list all available rooms', () => {});
  });

  describe('getRoom', () => {
    it('Should return a specified room', () => {});
    it('Should return undefined when room cannot be found', () => {});
  });

  describe('getRoomByUserID', () => {
    it('Should return a specified room', () => {});
    it('Should return undefined when room cannot be found', () => {});
  });

  describe('removeRoom', () => {
    it('Should remove room with a given id', () => {});
  });

  describe('addUser', () => {
    it('Should add a user to a given room', () => {});
    it('Should throw an error when room cannot be found', () => {});
    it('Should throw an error when user is already in a room', () => {});
  });

  describe('removeUser', () => {
    it('Should remove a user from a given room', () => {});
  });

  describe('room events', () => {
    it('Should destroy a room when receiving a ROOM_CLOSE internal event', () => {});
    it('Should remove a user when receiving USER_LEAVE internal event', () => {});
  });
});
