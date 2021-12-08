import { UseGuards } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
  SubscribeMessage,
  MessageBody,
  WsResponse,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomGatewayEvents } from './RoomGatewayEvents';
import { SocketAuthGuard } from '../Guards/SocketAuthGuard';
import { AuthService } from '../AuthService/AuthService';
import { UserService } from '../User/UserService';
import { RoomService } from './RoomService';
import { RoomGatewaySocketErrors } from './RoomGatewayErrors';
import { NameTakenError } from '../User/NameTakenError';
import { WsInvalidCredentials } from '../Guards/WsInvalidCredentials';
import { WsRoomNotFoundError } from './Errors/WsRoomNotFoundError';
import { WsResponseCreateRoom } from './DTO/WsResponseCreateRoom';
import { WsUserNotFoundError } from './Errors/WsUserNotFoundError';

@WebSocketGateway({ transports: ['websocket'] })
export class RoomGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  public server!: Server;

  constructor(
    private readonly roomService: RoomService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  public handleConnection(socket: Socket): void {
    if (!socket.handshake?.query?.name) {
      socket.emit(RoomGatewaySocketErrors.USER_NAME_MISSING_ERROR, {
        error: RoomGatewaySocketErrors.USER_NAME_MISSING_ERROR,
      });
      socket.disconnect();
      return;
    }

    try {
      const user = this.userService.createUser(
        socket.handshake.query.name as string,
        socket,
      );
      const token = this.authService.issueToken(user);

      socket.handshake.auth.token = token;
      socket.emit(RoomGatewayEvents.AUTHENTICATED, {
        token,
        user: user.getUserDetails(),
      });
    } catch (error) {
      if (error instanceof NameTakenError) {
        socket.emit(RoomGatewaySocketErrors.USER_NAME_TAKEN_ERROR, {
          error: RoomGatewaySocketErrors.USER_NAME_TAKEN_ERROR,
        });
      }
    }
  }

  public handleDisconnect(client: Socket): void {
    if (client.handshake?.auth?.token) {
      try {
        const decoded = this.authService.validateToken(
          client.handshake.auth.token,
        );

        if (!decoded) {
          throw new WsInvalidCredentials();
        }

        this.userService.removeUser(decoded.id);
      } catch (error) {
        if (error instanceof WsInvalidCredentials) {
          client.emit(RoomGatewaySocketErrors.INVALID_CREDENTIALS, {
            error: RoomGatewaySocketErrors.INVALID_CREDENTIALS,
          });
        }
      }
    }

    client.disconnect(true);
  }

  @UseGuards(SocketAuthGuard)
  @SubscribeMessage(RoomGatewayEvents.CREATE_ROOM)
  public createRoom(@ConnectedSocket() socket: Socket): WsResponseCreateRoom {
    const user = this.userService.getUser((socket as any).decoded.id);

    if (!user) {
      throw new WsUserNotFoundError();
    }

    const room = this.roomService.createRoom(user, this.server);

    return new WsResponseCreateRoom(room);
  }

  @UseGuards(SocketAuthGuard)
  @SubscribeMessage(RoomGatewayEvents.CREATE_ROOM)
  public listRooms(): WsResponse<any> {
    return {
      event: RoomGatewayEvents.LIST_ROOMS,
      data: Array.from(this.roomService.listRooms()).map((room) => {
        return {
          roomID: room.roomID,
          details: room.getBasicRoomDetails(),
        };
      }),
    };
  }

  @UseGuards(SocketAuthGuard)
  @SubscribeMessage(RoomGatewayEvents.JOIN_ROOM)
  public joinRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: any,
  ): WsResponse<unknown> {
    const room = this.roomService.getRoom(data.roomID);
    const user = this.userService.getUser(
      socket.handshake.query.userID as string,
    );

    if (!room) {
      throw new WsRoomNotFoundError();
    }

    if (!user) {
      throw new WsException('User not found');
    }

    room.addUser(user, data.spectator);

    // return room data such as users, etc
    return {
      event: RoomGatewayEvents.ROOM_JOINED,
      data: room.getRoomDetails(),
    };
  }
}
