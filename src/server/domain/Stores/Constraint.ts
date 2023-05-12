import {
  ConditionArgs,
  ICondition,
} from "./Conditions/CompositeLogicalCondition/Condition";
import { buildCondition } from "./Conditions/CompositeLogicalCondition/_typeDictionary";
import { FullBasketDTO } from "./StoresController";

export class Constraint {
  condition: ICondition;
  constructor(condition: ConditionArgs) {
    this.condition = buildCondition(condition);
  }

  public isSatisfiedBy(basket: FullBasketDTO): boolean {
    return this.condition.isSatisfiedBy(basket);
  }
}
