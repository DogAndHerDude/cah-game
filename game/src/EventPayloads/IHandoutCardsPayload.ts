import { IWhiteCard } from "../ICard";

export interface IHandoutCardsPayload {
  [key: string]: Array<IWhiteCard>;
}
