import { type FullBasketDTO } from "../../StoresController";
import {
  type conditionType,
  type LiteralArgs,
} from "../CompositeLogicalCondition/Condition";
import {
  standInTheTypeCondition,
  type ILiteralCondition,
} from "./LiteralCondition";

export class StoreCondition implements ILiteralCondition {
  private conditionType: conditionType;
  private amount: number;
  constructor(args: LiteralArgs) {
    this.conditionType = args.conditionType;
    this.amount = args.amount;
  }
  public isSatisfiedBy(basket: FullBasketDTO): boolean {
    let count = 0;
    basket.products.forEach((product) => {
      count += product.BasketQuantity;
    });
    return standInTheTypeCondition(this.conditionType, count, this.amount);
  }
  public getArgs(): LiteralArgs {
    return {
      amount: this.amount,
      conditionType: this.conditionType,
      searchFor: "",
      subType: "Store",
      type: "Literal",
    };
  }
}
