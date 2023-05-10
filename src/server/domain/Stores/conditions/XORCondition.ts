import { CompositeArgs, type ICondition } from "./Condition";
import { type FullBasketDTO } from "../StoresController";
import { build } from "./_typeDictionary";

export class XORCondition implements ICondition {
  private first: ICondition;
  private second: ICondition;
  constructor(composite: CompositeArgs) {
    this.first = build(composite.left);
    this.second = build(composite.right);
  }
  public isSatisfiedBy(basket: FullBasketDTO): boolean {
    return (
      (this.first.isSatisfiedBy(basket) &&
        !this.second.isSatisfiedBy(basket)) ||
      (!this.first.isSatisfiedBy(basket) && this.second.isSatisfiedBy(basket))
    );
  }
}
