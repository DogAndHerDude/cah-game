import { RoomService } from '../RoomService';
import { CardService } from '../../Cards/CardService';

describe('RoomService', () => {
  let roomService: RoomService;

  beforeEach(() => {
    roomService = new RoomService(new CardService());
  });

  describe('createRoom', () => {
    it.todo('Should create a room wit.todoh valid user details');
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
