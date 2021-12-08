import { IBlackCard, IWhiteCard } from "./ICard";

export interface IPack {
  name: string;
  white: Array<IWhiteCard>;
  black: Array<IBlackCard>;
  official: boolean;
}
