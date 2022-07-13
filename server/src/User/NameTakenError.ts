export class NameTakenError extends Error {
  constructor() {
    super('User name is taken');
    this.name = this.constructor.name;
  }
}
