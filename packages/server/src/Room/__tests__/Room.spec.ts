import { io, Socket as ClientSocket } from 'socket.io-client';
import { SocketServer } from '../../../test/SocketServer';
import { Room } from '../Room';
import { CardService } from '../../Cards/CardService';
import { User } from '../../User/User';
import { RoomEvents } from '../RoomEvents';

interface ITestEvent {
  event: RoomEvents;
  data: any;
  receiver: string;
}

// TODO: Figure out how to test sockets properly,
//       Currently each test gets the last ones emitted socket events.
//       Which kinda messes with expected output. No idea how to solve this right now.
//       It seems closing the server is not good enough.

describe('Room', () => {
  const ioOptions = {
    transports: ['websocket'],
    forceNew: true,
    reconnection: false,
  };
  let server: SocketServer;
  let client: typeof ClientSocket;

  describe('addUser', () => {
    beforeEach((done) => {
      server = new SocketServer();
      client = io(SocketServer.SERVER_URL, ioOptions);
      done();
    });

    afterEach((done) => {
      client.disconnect();
      server.socket.close();
      server.server.close();
      done();
    });

    it('The first user is added as a room owner', () => {
      const owner = new User('owner');
      const room = new Room(owner, server.socket, new CardService());
      const socketMock: any = {
        join() {
          return this;
        },
        on: () => void 0,
      };

      owner.setSocket(socketMock);
      room.addUser(owner, false);

      expect(room['roomOwner']).toEqual(
        expect.objectContaining({
          user: owner,
          spectator: false,
          socket: socketMock,
        }),
      );
    });

    it('Adds the user and notifies all clients of new user, and gives new player the game config', async () => {
      const owner = new User('owner');
      const user = new User('user');
      let room: Room;

      server.socket.on('connection', (s) => {
        if (!room) {
          owner.setSocket(s);
          room = new Room(owner, server.socket, new CardService());
          room.addUser(owner, false);
        } else {
          user.setSocket(s);
          room.addUser(user, false);
        }
      });

      const ownerClient = io(SocketServer.SERVER_URL, ioOptions);
      const userClient = io(SocketServer.SERVER_URL, ioOptions);
      const getEvents = () =>
        new Promise((resolve) => {
          const events: Array<ITestEvent> = [];

          ownerClient.on(
            RoomEvents.NEW_USER,
            (data: INewRoomUserEventPayload) => {
              events.push({
                event: RoomEvents.NEW_USER,
                data,
                receiver: ownerClient.id,
              });

              if (events.length === 4) {
                resolve(events);
              }
            },
          );
          ownerClient.on(
            RoomEvents.CONFIG_UPDATE,
            (data: IConfigUpdateEventPayload) => {
              events.push({
                event: RoomEvents.CONFIG_UPDATE,
                data,
                receiver: ownerClient.id,
              });

              if (events.length === 4) {
                resolve(events);
              }
            },
          );
          userClient.on(
            RoomEvents.NEW_USER,
            (data: INewRoomUserEventPayload) => {
              events.push({
                event: RoomEvents.NEW_USER,
                data,
                receiver: userClient.id,
              });

              if (events.length === 4) {
                resolve(events);
              }
            },
          );
          userClient.on(
            RoomEvents.CONFIG_UPDATE,
            (data: IConfigUpdateEventPayload) => {
              events.push({
                event: RoomEvents.NEW_USER,
                data,
                receiver: userClient.id,
              });

              if (events.length === 4) {
                resolve(events);
              }
            },
          );
        });
      const eventsPromise = getEvents();
      const events = await eventsPromise;

      expect(events).toHaveLength(4);
    });
    // adds user to room and to socket.room and emits new user event
    // the socket itself gets game config on join room
    // throws error when user exists
    // adds owner and one user to room but third connection without room does not join socket.room
  });

  describe('listUsers', () => {
    // it('Returns all existing users', async () => {
    //   let room: Room;
    //   const user = new User('bro');
    //   const testPromise = new Promise((resolve) => {
    //     server.socket.on('connection', (s: Socket) => {
    //       room = new Room(user, new CardService(), s);
    //       resolve(s);
    //     });
    //   });
    //   const result: any = await testPromise;
    //   expect(result).toBeDefined();
    //   expect(room.listUsers()).toEqual([new RoomUser(user, false, result)]);
    // });
  });

  describe('removeUser', () => {
    // removes user and makes it leave the room and emits player left
    // removes user on disconnect and makes it leave room
    // switches owners when owner leaves
    // emits close room when last user leaves
  });
  describe('roomEvents', () => {
    // updates config and emits to room
    // only allows owner to update config
    // emits start game
    // emits game events (mock the game for easier access)
    // sends events to game
    // responds to socket with error when starting already started game
  });
});
