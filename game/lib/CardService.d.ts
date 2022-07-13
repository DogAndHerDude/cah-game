import { IPack } from "./IPack";
export declare class CardService {
    private static hydrateCards;
    private deck;
    getDeck(packs?: Array<number>): Array<IPack>;
}
