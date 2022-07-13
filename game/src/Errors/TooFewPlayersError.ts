export class TooFewPlayersError extends Error {
  public static message: string = "Too few players";

  constructor(current: number, expected: number) {
    super(`${TooFewPlayersError.message}: ${current} out of ${expected}`);
    this.name = this.constructor.name;
  }
}
