import { FullBasketDTO } from "./StoresController";

export interface IDiscountCondition {
  isSatisfiedBy(basket: FullBasketDTO): boolean;
}
