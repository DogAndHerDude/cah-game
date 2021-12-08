export class DeckUninitializedError extends Error {
  constructor() {
    super('Deck is not initialized');
    this.name = this.constructor.name;
  }
}
