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
import { WsCreateRoomResponse } from './DTO/WsCreateRoomResponse';
import { WsUserNotFoundError } from './Errors/WsUserNotFoundError';
import { WsResponseListRooms } from './DTO/WsListRoomsResponse';
import { JoinRoomDTO } from './DTO/JoinRoomDTO';
import { RoomNotFoundError } from './Errors/RoomNotFoundError';
import { UserInRoomError } from './Errors/UserInRoomError';
import { WsUserInRoomError } from './Errors/WsUserInRoomError';
import { WsJoinRoomResponse } from './DTO/WsJoinRoomResponse';

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

        this.roomService.removeUser({ userID: decoded.id });
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
  public createRoom(@ConnectedSocket() socket: Socket): WsCreateRoomResponse {
    try {
      const user = this.userService.getUser((socket as any).decoded.id);

      if (!user) {
        throw new WsUserNotFoundError();
      }

      const room = this.roomService.createRoom(user, this.server);

      socket.emit(RoomGatewayEvents.NEW_ROOM, {
        roomID: room.roomID,
        details: room.getBasicRoomDetails(),
      });

      return new WsCreateRoomResponse(room);
    } catch (error) {
      if (error instanceof UserInRoomError) {
        throw new WsUserInRoomError();
      }

      throw new WsException(error.message);
    }
  }

  @UseGuards(SocketAuthGuard)
  @SubscribeMessage(RoomGatewayEvents.LIST_ROOMS)
  public listRooms(): WsResponseListRooms {
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
    @MessageBody() data: JoinRoomDTO,
  ): WsJoinRoomResponse {
    const user = this.userService.getUser(
      socket.handshake.query.userID as string,
    );

    if (!user) {
      throw new WsException('User not found');
    }

    try {
      const room = this.roomService.addUser(user, data.roomID, data.spectator);

      return new WsJoinRoomResponse(room);
    } catch (error) {
      if (error instanceof RoomNotFoundError) {
        throw new WsRoomNotFoundError();
      }

      if (error instanceof UserInRoomError) {
        throw new WsUserInRoomError();
      }

      throw new WsException(error.message);
    }
  }

  // TODO: Listen to room events
  //       - ROOM_CLOSED -> emit room closed to every client
  //       - ROOM_UPDATED -> emit updated basic room details
}
