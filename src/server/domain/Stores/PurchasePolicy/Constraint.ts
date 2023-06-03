import {
  type ConditionArgs,
  type ICondition,
} from "../Conditions/CompositeLogicalCondition/Condition";
import { buildCondition } from "../Conditions/CompositeLogicalCondition/_typeDictionary";
import { type FullBasketDTO } from "../StoresController";

export class Constraint {
  condition: ICondition;
  constructor(condition: ConditionArgs) {
    this.condition = buildCondition(condition);
  }

  public isSatisfiedBy(basket: FullBasketDTO): boolean {
    return this.condition.isSatisfiedBy(basket);
  }
  public getArgs(): ConditionArgs {
    return this.condition.getArgs();
  }
}
