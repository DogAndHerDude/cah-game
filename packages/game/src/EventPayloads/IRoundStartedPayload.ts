import { IBlackCard } from "../ICard";

export interface IRoundStartedPayload {
  blackCard: IBlackCard;
  cardCzar: string;
  roundTimer: number;
}
