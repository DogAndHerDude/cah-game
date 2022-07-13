export class UserExistsError extends Error {
  public static readonly message = 'User already exists';

  constructor() {
    super(UserExistsError.message);
    this.name = this.constructor.name;
  }
}
