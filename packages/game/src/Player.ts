import { IWhiteCard } from "./ICard";
import { CardNotFoundError } from "./CardNotFoundError";
import { IPlainPlayer } from "./IPlainPlayer";

export class Player {
  private cardInPlay?: string;
  private cardPick?: string;
  private cards: Array<IWhiteCard> = [];
  private playedCards: Array<IWhiteCard> = [];
  private points = 0;

  constructor(public readonly id: string) {}

  public getCards(): Array<IWhiteCard> {
    return this.cards;
  }

  public addCards(cards: Array<IWhiteCard>): void {
    this.cards = [...this.cards, ...cards];
  }

  public playCard(text: string): void {
    const card = this.cards.find((card) => card.text === text);

    if (!card) {
      throw new CardNotFoundError();
    }

    this.cardInPlay = card.text;
  }

  public pickCard(text: string): void {
    this.cardPick = text;
  }

  public getCardPick(): string | undefined {
    return this.cardPick;
  }

  public getCardInPlay(): string | undefined {
    return this.cardInPlay;
  }

  public clearCardInPlay(): void {
    if (!this.cardInPlay) {
      // TODO: throw error no card in play
    }

    // this.playedCards = [...this.playedCards, this.cardInPlay];
    this.cards = this.cards.filter((card) => card.text !== this.cardInPlay);
    this.cardInPlay = undefined;
  }

  public getPoints(): number {
    return this.points;
  }

  public addPoint(): void {
    this.points += 1;
  }

  public toPlain(): IPlainPlayer {
    return {
      id: this.id,
      points: this.points,
    };
  }
}
