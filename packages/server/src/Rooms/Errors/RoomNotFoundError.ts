export class RoomNotFoundError extends Error {
  public static message = 'Room not found';

  constructor() {
    super(RoomNotFoundError.message);
    this.name = this.constructor.name;
  }
}
