import { FullBasketDTO } from "../../StoresController";
import {
  Condition_Type,
  LiteralArgs,
} from "../CompositeLogicalCondition/Condition";
import { ILiteralCondition } from "./LiteralCondition";

export class CategoryCondition implements ILiteralCondition {
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
      if (product.product.category === this.search_For) {
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
