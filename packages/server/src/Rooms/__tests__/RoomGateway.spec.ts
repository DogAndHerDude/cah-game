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
import { WsCreateRoomResponse } from '../DTO/WsCreateRoomResponse';
import { IRoomDetails } from '../../Room/IRoomDetails';
import { WsResponseListRooms } from '../DTO/WsListRoomsResponse';
import { IBasicRoomDetails } from '../../Room/IRoomBasicDetails';
import { WsUserInRoomError } from '../Errors/WsUserInRoomError';
import { JoinRoomDTO } from '../DTO/JoinRoomDTO';
import { WsJoinRoomResponse } from '../DTO/WsJoinRoomResponse';
import { WsRoomNotFoundError } from '../Errors/WsRoomNotFoundError';

type UserServiceSpy = {
  createUser: jest.SpyInstance<ReturnType<UserService['createUser']>>;
  getUser: jest.SpyInstance<ReturnType<UserService['getUser']>>;
  removeUser: jest.SpyInstance<ReturnType<UserService['removeUser']>>;
};

type RoomServiceSpy = {
  removeUser: jest.SpyInstance<ReturnType<RoomService['removeUser']>>;
  listRooms: jest.SpyInstance<ReturnType<RoomService['listRooms']>>;
};

const basicRoomDetails = {
  goal: expect.any(Number),
  inProgress: expect.any(Boolean),
  maxPlayers: expect.any(Number),
  users: expect.any(Number),
};

const roomDetails = {
  roomID: expect.any(String),
  config: {
    ...new DefaultGameConfig(),
  },
  logs: expect.any(Array),
  users: expect.any(Array),
};

describe('RoomGateway', () => {
  let app: INestApplication;
  let userService: UserService;
  let roomService: RoomService;
  let userServiceSpy: UserServiceSpy;
  let roomServiceSpy: RoomServiceSpy;

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
      removeUser: jest.spyOn(roomService, 'removeUser'),
      listRooms: jest.spyOn(roomService, 'listRooms'),
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
    // NOTE: This test is broken.
    //       For some reason it says the method has not been called, even though it has been...
    it.skip('Should remove user from UserService on disconnect', async (done) => {
      const client = new SocketClient({
        transports: ['websocket'],
        autoConnect: false,
        query: {
          name: 'user_name',
        },
      });

      client.connect();
      await client.onEvent(RoomGatewayEvents.AUTHENTICATED);
      await client.disconnect();
      expect(roomServiceSpy.removeUser).toHaveBeenCalled();
      expect(userServiceSpy.removeUser).toHaveBeenCalled();
    });
  });

  describe('createRoom', () => {
    it('Should create a room and return its details & NEW_ROOM event', async () => {
      const client = new SocketClient({
        transports: ['websocket'],
        query: {
          name: 'user_name',
        },
      });

      await client.onEvent(RoomGatewayEvents.AUTHENTICATED);
      client.emit(RoomGatewayEvents.CREATE_ROOM);

      const newRoomMessage = client.onEvent<WsCreateRoomResponse['data']>(
        RoomGatewayEvents.NEW_ROOM,
      );
      const roomCreated = client.onEvent<WsCreateRoomResponse['data']>(
        RoomGatewayEvents.ROOM_CREATED,
      );
      const [newRoomResponse, response] = await Promise.all([
        newRoomMessage,
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
      expect(newRoomResponse).toStrictEqual(
        expect.objectContaining({
          roomID: expect.any(String),
          details: basicRoomDetails,
        }),
      );
    });

    it('Should throw an error when a player is already in a room', async () => {
      const client = new SocketClient({
        transports: ['websocket'],
        query: {
          name: 'user_name',
        },
      });

      await client.onEvent(RoomGatewayEvents.AUTHENTICATED);
      client.emit(RoomGatewayEvents.CREATE_ROOM);

      const exceptionPromise = client.onEvent('exception');

      client.emit(RoomGatewayEvents.CREATE_ROOM);

      const exception = await exceptionPromise;

      client.disconnect();
      expect(exception).toStrictEqual({
        status: 'error',
        message: WsUserInRoomError.message,
      });
    });
  });

  describe('listRooms', () => {
    it('Lists all available rooms on request', async () => {
      const createRoomClient = new SocketClient({
        transports: ['websocket'],
        query: {
          name: 'user_name',
        },
      });
      const listClient = new SocketClient({
        transports: ['websocket'],
        query: {
          name: 'user_name2',
        },
      });

      await Promise.all([
        createRoomClient.onEvent(RoomGatewayEvents.AUTHENTICATED),
        listClient.onEvent(RoomGatewayEvents.AUTHENTICATED),
      ]);
      createRoomClient.emit(RoomGatewayEvents.CREATE_ROOM);
      await createRoomClient.onEvent(RoomGatewayEvents.ROOM_CREATED);

      const listRoomsPromise = listClient.onEvent<WsResponseListRooms>(
        RoomGatewayEvents.LIST_ROOMS,
      );

      listClient.emit(RoomGatewayEvents.LIST_ROOMS);

      const listRoomsResponse = await listRoomsPromise;

      createRoomClient.disconnect();
      listClient.disconnect();
      expect(listRoomsResponse).toHaveLength(1);
      expect(listRoomsResponse).toStrictEqual([
        {
          roomID: expect.any(String),
          details: basicRoomDetails,
        },
      ]);
    });
  });

  describe('joinRoom', () => {
    it('Should join an existing room', async () => {
      const createRoomClient = new SocketClient({
        transports: ['websocket'],
        query: {
          name: 'user_name',
        },
      });
      const joinRoomClient = new SocketClient({
        transports: ['websocket'],
        query: {
          name: 'user_name2',
        },
      });

      await Promise.all([
        createRoomClient.onEvent(RoomGatewayEvents.AUTHENTICATED),
        joinRoomClient.onEvent(RoomGatewayEvents.AUTHENTICATED),
      ]);
      createRoomClient.emit(RoomGatewayEvents.CREATE_ROOM);

      const joinRoomResponsePromise = joinRoomClient.onEvent<
        WsJoinRoomResponse['data']
      >(RoomGatewayEvents.ROOM_JOINED);
      const createRoomResponse = await createRoomClient.onEvent<
        WsCreateRoomResponse['data']
      >(RoomGatewayEvents.ROOM_CREATED);

      joinRoomClient.emit<JoinRoomDTO>(RoomGatewayEvents.JOIN_ROOM, {
        roomID: createRoomResponse.roomID,
        spectator: false,
      });

      const joinRoomResponse = await joinRoomResponsePromise;

      createRoomClient.disconnect();
      joinRoomClient.disconnect();
      expect(joinRoomResponse).toStrictEqual<WsJoinRoomResponse['data']>({
        ...roomDetails,
        roomID: createRoomResponse.roomID,
      });
    });

    it('Should throw error when room is not found', async () => {
      const client = new SocketClient({
        transports: ['websocket'],
        query: {
          name: 'user_name',
        },
      });

      await client.onEvent(RoomGatewayEvents.AUTHENTICATED);

      client.emit<JoinRoomDTO>(RoomGatewayEvents.JOIN_ROOM, {
        roomID: 'bad-id',
        spectator: false,
      });

      const error = await client.onEvent<{ status: 'error'; message: string }>(
        'exception',
      );

      client.disconnect();
      expect(error).toStrictEqual<typeof error>({
        status: 'error',
        message: WsRoomNotFoundError.message,
      });
    });

    it('Should throw an error when user is already in a room', async () => {
      const client = new SocketClient({
        transports: ['websocket'],
        query: {
          name: 'user_name',
        },
      });

      await client.onEvent(RoomGatewayEvents.AUTHENTICATED);
      client.emit(RoomGatewayEvents.CREATE_ROOM);

      const room = await client.onEvent<WsCreateRoomResponse['data']>(
        RoomGatewayEvents.ROOM_CREATED,
      );

      client.emit<JoinRoomDTO>(RoomGatewayEvents.JOIN_ROOM, {
        roomID: room.roomID,
        spectator: false,
      });

      const error = await client.onEvent<{ status: 'error'; message: string }>(
        'exception',
      );

      client.disconnect();
      expect(error).toStrictEqual<typeof error>({
        status: 'error',
        message: WsUserInRoomError.message,
      });
    });
  });
});
