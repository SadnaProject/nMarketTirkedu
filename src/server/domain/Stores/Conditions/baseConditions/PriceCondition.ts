import { type FullBasketDTO } from "../../StoresController";
import {
  type conditionType,
  type LiteralArgs,
} from "../CompositeLogicalCondition/Condition";
import {
  standInTheTypeCondition,
  type ILiteralCondition,
} from "./LiteralCondition";

export class PriceCondition implements ILiteralCondition {
  private conditionType: conditionType;
  private amount: number;
  constructor(args: LiteralArgs) {
    this.conditionType = args.conditionType;
    this.amount = args.amount;
  }
  public isSatisfiedBy(basket: FullBasketDTO): boolean {
    let price = 0;
    basket.products.forEach((product) => {
      price +=
        product.BasketQuantity *
        product.product.price *
        (1 - product.Discount / 100);
    });
    return standInTheTypeCondition(this.conditionType, price, this.amount);
  }
  public getArgs(): LiteralArgs {
    return {
      amount: this.amount,
      conditionType: this.conditionType,
      searchFor: "",
      subType: "Price",
      type: "Literal",
    };
  }
}
