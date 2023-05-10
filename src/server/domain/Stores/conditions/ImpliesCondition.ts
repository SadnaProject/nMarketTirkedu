import { CompositeArgs, type ICondition } from "./Condition";
import { type FullBasketDTO } from "../StoresController";
import { build } from "./_typeDictionary";

export class ImpliesCondition implements ICondition {
  private implies: ICondition;
  private condition: ICondition;

  constructor(composite: CompositeArgs) {
    this.implies = build(composite.left);
    this.condition = build(composite.right);
  }

  public isSatisfiedBy(basket: FullBasketDTO): boolean {
    if (this.implies.isSatisfiedBy(basket)) {
      return this.condition.isSatisfiedBy(basket);
    }
    return true;
  }
}
