import { CompositeArgs, type ICondition } from "./Condition";
import { type FullBasketDTO } from "../StoresController";
import { buildCondition } from "./_typeDictionary";

export class ImpliesCondition implements ICondition {
  private implies: ICondition;
  private condition: ICondition;

  constructor(composite: CompositeArgs) {
    this.implies = buildCondition(composite.left);
    this.condition = buildCondition(composite.right);
  }

  public isSatisfiedBy(basket: FullBasketDTO): boolean {
    if (this.implies.isSatisfiedBy(basket)) {
      return this.condition.isSatisfiedBy(basket);
    }
    return true;
  }
}
