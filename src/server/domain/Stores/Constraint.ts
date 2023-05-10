import { FullBasketDTO } from "./StoresController";
import { ConditionArgs, ICondition } from "./conditions/Condition";
import { buildCondition } from "./conditions/_typeDictionary";

export class Constraint {
  condition: ICondition;
  constructor(condition: ConditionArgs) {
    this.condition = buildCondition(condition);
  }

  public isSatisfiedBy(basket: FullBasketDTO): boolean {
    return this.condition.isSatisfiedBy(basket);
  }
}
