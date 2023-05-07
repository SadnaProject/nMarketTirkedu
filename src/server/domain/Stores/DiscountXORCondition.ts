import { IDiscountCondition } from "./DiscountCondition";
import { FullBasketDTO } from "./StoresController";

export class DiscountXORCondition implements IDiscountCondition {
  private first: IDiscountCondition;
  private second: IDiscountCondition;
  constructor(first: IDiscountCondition, second: IDiscountCondition) {
    this.first = first;
    this.second = second;
  }
  public isSatisfiedBy(basket: FullBasketDTO): boolean {
    return (
      (this.first.isSatisfiedBy(basket) &&
        !this.second.isSatisfiedBy(basket)) ||
      (!this.first.isSatisfiedBy(basket) && this.second.isSatisfiedBy(basket))
    );
  }
}
