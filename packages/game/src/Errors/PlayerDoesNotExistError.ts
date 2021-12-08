export class PlayerDoesNotExistError extends Error {
  public static message: string = "Player does not exist";

  constructor() {
    super(PlayerDoesNotExistError.message);
    this.name = this.constructor.name;
  }
}
