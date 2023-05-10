import { type ICondition } from "./Condition";
import { type FullBasketDTO } from "../StoresController";

class ORCondition implements ICondition {
  private first: ICondition;
  private second: ICondition;
  constructor(first: ICondition, second: ICondition) {
    this.first = first;
    this.second = second;
  }
  public isSatisfiedBy(basket: FullBasketDTO): boolean {
    return (
      this.first.isSatisfiedBy(basket) || this.second.isSatisfiedBy(basket)
    );
  }
}
