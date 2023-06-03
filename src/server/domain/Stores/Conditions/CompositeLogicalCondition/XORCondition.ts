import { type FullBasketDTO } from "../../StoresController";
import {
  type ConditionArgs,
  type CompositeArgs,
  type ICondition,
} from "./Condition";
import { buildCondition } from "./_typeDictionary";

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
  public getArgs(): ConditionArgs {
    return {
      left: this.first.getArgs(),
      right: this.second.getArgs(),
      subType: "Implies",
      type: "Composite",
    };
  }
}
