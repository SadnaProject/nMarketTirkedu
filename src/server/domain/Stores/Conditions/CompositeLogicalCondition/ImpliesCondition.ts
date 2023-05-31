import { type FullBasketDTO } from "../../StoresController";
import {
  type CompositeArgs,
  type ICondition,
  type ConditionArgs,
} from "./Condition";
import { buildCondition } from "./_typeDictionary";

export class ImpliesCondition implements ICondition {
  private first: ICondition;
  private second: ICondition;

  constructor(composite: CompositeArgs) {
    this.first = buildCondition(composite.left);
    this.second = buildCondition(composite.right);
  }

  public isSatisfiedBy(basket: FullBasketDTO): boolean {
    if (this.first.isSatisfiedBy(basket)) {
      return this.second.isSatisfiedBy(basket);
    }
    return true;
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
