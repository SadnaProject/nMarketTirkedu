import { type FullBasketDTO } from "../../StoresController";
import {
  type conditionType,
  type LiteralArgs,
} from "../CompositeLogicalCondition/Condition";
import { type ILiteralCondition } from "./LiteralCondition";

export class CategoryCondition implements ILiteralCondition {
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
      if (product.product.category === this.searchFor) {
        count += product.BasketQuantity;
      }
    });
    switch (this.conditionType) {
      case "AtLeast":
        return count >= this.amount;
      case "AtMost":
        return count <= this.amount;
      case "Exactly":
        return count === this.amount;
    }
  }
}
