export enum RoomGatewayEvents {
  AUTHENTICATED = 'AUTHENTICATED',
  USER_NAME_ERROR = 'USER_NAME_ERROR',
  LIST_ROOMS = 'LIST_ROOMS',
  CREATE_ROOM = 'CREATE_ROOM', // For response directly to the client that created the room
  JOIN_ROOM = 'JOIN_ROOM',
  ROOM_CREATED = 'ROOM_CREATED',
  ROOM_JOINED = 'ROOM_JOINED',
}
