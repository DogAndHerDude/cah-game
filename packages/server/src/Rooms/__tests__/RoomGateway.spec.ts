import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { DefaultGameConfig } from '@cah-game/game';
import { RoomGatewayEvents } from '../RoomGatewayEvents';
import { RoomGateway } from '../RoomGateway';
import { RoomService } from '../RoomService';
import { UserService } from '../../User/UserService';
import { AuthModule } from '../../AuthService/AuthModule';
import { UserModule } from '../../User/UserModule';
import { CardModule } from '../../Cards/CardModule';
import { SocketClient } from '../../../test/SocketClient';
import { RoomGatewaySocketErrors } from '../RoomGatewayErrors';
import { WsResponseCreateRoom } from '../DTO/WsResponseCreateRoom';
import { IRoomDetails } from '../../Room/IRoomDetails';
import { WsResponseListRooms } from '../DTO/WsListRoomsResponse';
import { Room } from '../../Room/Room';

type UserServiceSpy = {
  createUser: jest.SpyInstance<ReturnType<UserService['createUser']>>;
  getUser: jest.SpyInstance<ReturnType<UserService['getUser']>>;
  removeUser: jest.SpyInstance<ReturnType<UserService['removeUser']>>;
};

type RoomServiceSpy = {
  getRoomsByUserID: jest.SpyInstance<
    ReturnType<RoomService['getRoomsByUserID']>
  >;
};

type RoomSpy = {
  removeUser: jest.SpyInstance<ReturnType<Room['removeUser']>>;
};

describe('RoomGateway', () => {
  let app: INestApplication;
  let userService: UserService;
  let roomService: RoomService;
  let userServiceSpy: UserServiceSpy;
  let roomServiceSpy: RoomServiceSpy;
  let roomSpy: RoomSpy;

  beforeEach(async () => {
    const testingModule = await Test.createTestingModule({
      imports: [AuthModule, UserModule, CardModule],
      providers: [RoomGateway, RoomService],
    }).compile();
    userService = testingModule.get(UserService);
    roomService = testingModule.get(RoomService);
    app = await testingModule.createNestApplication<INestApplication>();
    userServiceSpy = {
      createUser: jest.spyOn(userService, 'createUser'),
      getUser: jest.spyOn(userService, 'getUser'),
      removeUser: jest.spyOn(userService, 'removeUser'),
    };
    roomServiceSpy = {
      getRoomsByUserID: jest.spyOn(roomService, 'getRoomsByUserID'),
    };
    roomSpy = {
      removeUser: jest.spyOn(Room.prototype, 'removeUser'),
    };

    await app.listen(3000);
  });

  afterEach(() => {
    app.close();
  });

  describe('handleConnection', () => {
    it('Should return an error when no name is given', async () => {
      const client = new SocketClient({
        autoConnect: false,
        transports: ['websocket'],
      });

      try {
        client.connect();
        await client.onEvent(RoomGatewaySocketErrors.USER_NAME_MISSING_ERROR);
        client.disconnect();
      } catch (error: any) {
        expect(error.error).toEqual(
          RoomGatewaySocketErrors.USER_NAME_MISSING_ERROR,
        );
      }
    });

    it('Should return authentication details when name is given', async () => {
      const name = 'user_name';
      const client = new SocketClient({
        transports: ['websocket'],
        query: {
          name,
        },
      });
      const response = await client.onEvent<{
        token: string;
        user: { id: string; name: string };
      }>(RoomGatewayEvents.AUTHENTICATED);

      expect(userServiceSpy.createUser).toHaveBeenCalled();
      expect(response).toEqual(
        expect.objectContaining({
          token: expect.any(String),
          user: {
            id: expect.any(String),
            name,
          },
        }),
      );
      client.disconnect();
    });

    it('Should return am error when the name is already taken', async () => {
      const name = 'user_name';
      const client1 = new SocketClient({
        transports: ['websocket'],
        query: {
          name,
        },
      });
      const client2 = new SocketClient({
        transports: ['websocket'],
        autoConnect: false,
        query: {
          name,
        },
      });

      try {
        client2.connect();
        await client2.onEvent(RoomGatewaySocketErrors.USER_NAME_TAKEN_ERROR);
        client1.disconnect();
        client2.disconnect();
      } catch (error: any) {
        expect(error.error).toEqual(
          RoomGatewaySocketErrors.USER_NAME_TAKEN_ERROR,
        );
      }
    });
  });

  describe('handleDisconnect', () => {
    it('Should remove user from UserService on disconnect', async () => {
      const client = new SocketClient({
        transports: ['websocket'],
        query: {
          name: 'user_name',
        },
      });

      await client.onEvent(RoomGatewayEvents.AUTHENTICATED);
      client.disconnect();
      // push to the end of the stack while waiting for the handleDisconnect to complete
      setTimeout(() => {
        expect(userServiceSpy.createUser).toHaveBeenCalled();
        expect(roomServiceSpy.getRoomsByUserID).toHaveBeenCalled();
        expect(roomSpy.removeUser).toHaveBeenCalledTimes(1);
        expect(userServiceSpy.removeUser).toHaveBeenCalled();
      }, 0);
    });
  });

  describe('createRoom', () => {
    it('Should create a room and return its details & LIST_ROOMS event', async () => {
      const client = new SocketClient({
        transports: ['websocket'],
        query: {
          name: 'user_name',
        },
      });

      await client.onEvent(RoomGatewayEvents.AUTHENTICATED);
      client.emit(RoomGatewayEvents.CREATE_ROOM);

      const listRooms = client.onEvent<WsResponseListRooms['data']>(
        RoomGatewayEvents.LIST_ROOMS,
      );
      const roomCreated = client.onEvent<WsResponseCreateRoom['data']>(
        RoomGatewayEvents.ROOM_CREATED,
      );
      const [listRoomsResponse, response] = await Promise.all([
        listRooms,
        roomCreated,
      ]);

      client.disconnect();
      expect(response).toStrictEqual(
        expect.objectContaining<IRoomDetails>({
          roomID: expect.any(String),
          config: {
            ...new DefaultGameConfig(),
          },
          logs: expect.any(Array),
          users: expect.any(Array),
        }),
      );
      expect(listRoomsResponse).toHaveLength(1);
    });
  });

  // describe('listRooms', async () => {
  //   it('Lists all available rooms on request');
  // });

  // TODO: joinRoom
});
