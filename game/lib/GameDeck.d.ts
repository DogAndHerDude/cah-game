import { IBlackCard, IWhiteCard } from "./ICard";
import { IPack } from "./IPack";
export declare class GameDeck {
    private whiteCards;
    private blackCards;
    constructor(deck: Array<IPack>);
    getWhiteCards(count: number): Array<IWhiteCard>;
    getBlackCard(): IBlackCard | undefined;
    listWhiteCards(): Array<IWhiteCard>;
    listBlackCards(): Array<IBlackCard>;
    private mapWhiteCards;
    private mapBlackCards;
}
