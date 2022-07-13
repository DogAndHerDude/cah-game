import * as cah from "./cah-cards-compact.json";
import { IPack } from "./IPack";

export class CardService {
  private static hydrateCards(): Array<IPack> {
    return cah.packs
      .filter(({ official }) => official)
      .map((pack, packIndex) => ({
        ...pack,
        white: pack.white.map((cardIndex) => ({
          text: cah.white[cardIndex],
          pack: packIndex,
        })),
        black: pack.black.map((cardIndex) => ({
          ...cah.black[cardIndex],
          pack: packIndex,
        })),
      }));
  }

  private deck: Array<IPack> = CardService.hydrateCards();

  public getDeck(packs?: Array<number>): Array<IPack> {
    if (!packs || !packs.length) {
      return JSON.parse(JSON.stringify(this.deck));
    }

    return JSON.parse(
      JSON.stringify(this.deck.filter((_, index) => packs.includes(index)))
    );
  }
}
