import { type FullBasketDTO } from "../../StoresController";
import {
  type conditionType,
  type LiteralArgs,
} from "../CompositeLogicalCondition/Condition";
import {
  standInTheTypeCondition,
  type ILiteralCondition,
} from "./LiteralCondition";

export class ProductCondition implements ILiteralCondition {
  private conditionType: conditionType;
  private amount: number;
  private searchFor: string;
  constructor(args: LiteralArgs) {
    this.conditionType = args.conditionType;
    this.amount = args.amount;
    this.searchFor = args.searchFor;
  }
  public isSatisfiedBy(basket: FullBasketDTO): boolean {
    let count = 0;
    basket.products.forEach((product) => {
      if (product.product.name === this.searchFor) {
        count += product.BasketQuantity;
      }
    });
    return standInTheTypeCondition(this.conditionType, count, this.amount);
  }
  public getArgs(): LiteralArgs {
    return {
      amount: this.amount,
      conditionType: this.conditionType,
      searchFor: this.searchFor,
      subType: "Product",
      type: "Literal",
    };
  }
}
