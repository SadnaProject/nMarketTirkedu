import { type IDiscountCondition } from "./DiscountCondition";
import { type FullBasketDTO } from "./StoresController";

class DiscountImpliesCondition implements IDiscountCondition {
  private implies: IDiscountCondition;
  private condition: IDiscountCondition;

  constructor(implies: IDiscountCondition, condition: IDiscountCondition) {
    this.implies = implies;
    this.condition = condition;
  }

  public isSatisfiedBy(basket: FullBasketDTO): boolean {
    if (this.implies.isSatisfiedBy(basket)) {
      return this.condition.isSatisfiedBy(basket);
    }
    return true;
  }
}
