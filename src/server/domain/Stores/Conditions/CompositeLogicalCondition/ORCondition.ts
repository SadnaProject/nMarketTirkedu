import { type FullBasketDTO } from "../../StoresController";
import { type CompositeArgs, type ICondition } from "./Condition";
import { buildCondition } from "./_typeDictionary";
export class ORCondition implements ICondition {
  private first: ICondition;
  private second: ICondition;
  constructor(composite: CompositeArgs) {
    this.first = buildCondition(composite.left);
    this.second = buildCondition(composite.right);
  }
  public isSatisfiedBy(basket: FullBasketDTO): boolean {
    return (
      this.first.isSatisfiedBy(basket) || this.second.isSatisfiedBy(basket)
    );
  }
}
