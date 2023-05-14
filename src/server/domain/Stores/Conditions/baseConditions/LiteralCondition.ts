import { type FullBasketDTO } from "../../StoresController";

export interface ILiteralCondition {
  isSatisfiedBy(basket: FullBasketDTO): boolean;
}
