import { FullBasketDTO } from "../../StoresController";
import { LiteralCondition } from "../../conditions/LiteralCondition";
import {
  Condition_Type,
  LiteralArgs,
} from "../CompositeLogicalDiscounts/Condition";

export class ProductCondition implements LiteralCondition {
  private condition_type: Condition_Type;
  private amount: number;
  private search_For: string;
  constructor(args: LiteralArgs) {
    this.condition_type = args.condition_type;
    this.amount = args.amount;
    this.search_For = args.search_For;
  }
  public isSatisfiedBy(basket: FullBasketDTO): boolean {
    let count = 0;
    basket.products.forEach((product) => {
      if (product.product.name === this.search_For) {
        count += product.BasketQuantity;
      }
    });
    switch (this.condition_type) {
      case "AtLeast":
        return count >= this.amount;
      case "AtMost":
        return count <= this.amount;
      case "Exactly":
        return count === this.amount;
    }
  }
}
