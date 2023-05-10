import { type ICondition } from "./Condition";
import { type FullBasketDTO } from "../StoresController";

class ImpliesCondition implements ICondition {
  private implies: ICondition;
  private condition: ICondition;

  constructor(implies: ICondition, condition: ICondition) {
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
