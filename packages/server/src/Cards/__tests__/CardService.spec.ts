import { CardService } from '../CardService';
import * as cah from '../cah-cards-compact.json';

describe('CardService', () => {
  describe('getDeck', () => {
    it('Should return all decks with no arguments passed', () => {
      const cardService = new CardService();

      expect(cardService.getDeck()).toHaveLength(
        cah.packs.filter(({ official }) => official).length,
      );
    });

    it('Should return all decks with an empty array passed', () => {
      const cardService = new CardService();

      expect(cardService.getDeck([])).toHaveLength(
        cah.packs.filter(({ official }) => official).length,
      );
    });

    it('Should return only the packs specified in the arguments', () => {
      const cardService = new CardService();
      const deck = cardService.getDeck([0]);
      const officialPacks = cah.packs.filter(({ official }) => official);

      expect(deck).toHaveLength(1);
      expect(deck[0].name).toBe(officialPacks[0].name);
    });
  });
});
