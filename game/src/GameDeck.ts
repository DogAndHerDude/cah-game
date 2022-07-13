import shuffle from "lodash.shuffle";
import { IBlackCard, IWhiteCard } from "./ICard";
import { IPack } from "./IPack";

export class GameDeck {
  private whiteCards: Array<IWhiteCard>;
  private blackCards: Array<IBlackCard>;

  constructor(deck: Array<IPack>) {
    this.whiteCards = this.mapWhiteCards(deck);
    this.blackCards = this.mapBlackCards(deck);
  }

  public getWhiteCards(count: number): Array<IWhiteCard> {
    return this.whiteCards.splice(0, count);
  }

  public getBlackCard(): IBlackCard | undefined {
    return this.blackCards.shift();
  }

  public listWhiteCards(): Array<IWhiteCard> {
    return this.whiteCards.slice();
  }

  public listBlackCards(): Array<IBlackCard> {
    return this.blackCards.slice();
  }

  private mapWhiteCards(deck: Array<IPack>): Array<IWhiteCard> {
    return shuffle(
      deck.reduce<Array<IWhiteCard>>((accumulator, pack) => {
        accumulator = [...accumulator, ...pack.white];

        return accumulator;
      }, [])
    );
  }

  private mapBlackCards(deck: Array<IPack>): Array<IBlackCard> {
    return shuffle(
      deck.reduce<Array<IBlackCard>>((accumulator, pack) => {
        accumulator = [...accumulator, ...pack.black];

        return accumulator;
      }, [])
    );
  }
}
