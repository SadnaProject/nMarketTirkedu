import { FullBasketDTO } from "../../StoresController";
import {
  CompositeArgs,
  ICondition,
} from "../CompositeLogicalDiscounts/Condition";
import { buildCondition } from "../CompositeLogicalDiscounts/_typeDictionary";

export class XORCondition implements ICondition {
  private first: ICondition;
  private second: ICondition;
  constructor(composite: CompositeArgs) {
    this.first = buildCondition(composite.left);
    this.second = buildCondition(composite.right);
  }
  public isSatisfiedBy(basket: FullBasketDTO): boolean {
    return (
      (this.first.isSatisfiedBy(basket) &&
        !this.second.isSatisfiedBy(basket)) ||
      (!this.first.isSatisfiedBy(basket) && this.second.isSatisfiedBy(basket))
    );
  }
}
