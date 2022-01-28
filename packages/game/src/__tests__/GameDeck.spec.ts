import { IBlackCard } from "../ICard";
import { CardService } from "../CardService";
import { GameDeck } from "../GameDeck";

describe("GameDeck", () => {
  let cardService: CardService;

  beforeAll(() => {
    cardService = new CardService();
  });

  describe("getWhiteCards", () => {
    it.each([
      {
        packs: [0],
        whiteCardCount: 2,
      },
      {
        packs: [1, 2],
        whiteCardCount: 4,
      },
    ])(
      "Maps the deck and returns specified amount of expected white cards from a given deck",
      ({ packs, whiteCardCount }) => {
        const deck = cardService.getDeck(packs);
        const gameDeck = new GameDeck(deck);
        const preDrawWhiteCardLength = gameDeck.listWhiteCards().length;
        const whiteCards = gameDeck.getWhiteCards(whiteCardCount);

        expect(whiteCards).toHaveLength(whiteCardCount);
        expect(gameDeck.listWhiteCards()).toHaveLength(
          preDrawWhiteCardLength - whiteCardCount
        );
        expect(
          whiteCards.every((whiteCard) =>
            deck[0].white.find(
              (entry) =>
                entry.text === whiteCard.text && entry.pack === whiteCard.pack
            )
          )
        );
        expect(
          gameDeck.listWhiteCards().find((entry) => {
            return !!whiteCards.find(
              (whiteCard) =>
                whiteCard.text === entry.text && whiteCard.pack === entry.pack
            );
          })
        ).toBeUndefined();
      }
    );
  });

  describe("getBlackCard", () => {
    it.each([
      {
        packs: [0],
      },
      {
        packs: [1, 2],
      },
    ])(
      "Maps and returns a single black card from a given deck",
      ({ packs }) => {
        const deck = cardService.getDeck(packs);
        const gameDeck = new GameDeck(deck);
        const preDrawDeck = gameDeck.listBlackCards();
        const blackCard = gameDeck.getBlackCard() as IBlackCard;
        const cardMatcher = (card: IBlackCard) =>
          card.pack === blackCard.pack &&
          card.text === blackCard.text &&
          card.pick === blackCard.pick;

        expect(preDrawDeck.find(cardMatcher)).toBe(blackCard);
        expect(gameDeck.listBlackCards()).toHaveLength(preDrawDeck.length - 1);
        expect(gameDeck.listBlackCards().find(cardMatcher)).toBeUndefined();
      }
    );
  });
});
