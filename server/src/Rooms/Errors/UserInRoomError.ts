export class UserInRoomError extends Error {
  public static message = 'User is already in a room';

  constructor() {
    super(UserInRoomError.message);
    this.name = this.constructor.name;
  }
}
