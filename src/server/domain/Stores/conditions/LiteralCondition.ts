import {
  Condition_Type,
  Condition_on,
  LiteralArgs,
  type ICondition,
} from "./Condition";
import { type FullBasketDTO } from "../StoresController";

export class LiteralCondition implements ICondition {
  private condition_on: Condition_on;
  private condition_type: Condition_Type;
  private amount: number;
  private search_For: string;
  constructor(args: LiteralArgs) {
    this.condition_on = args.condition_on;
    this.condition_type = args.condition_type;
    this.amount = args.amount;
    this.search_For = args.search_For;
  }
  public isSatisfiedBy(basket: FullBasketDTO): boolean {
    let count = 0;
    switch (this.condition_on) {
      case "Product":
        basket.products.forEach((product) => {
          if (product.product.name === this.search_For) {
            count += product.BasketQuantity;
          }
        });
        break;
      case "Category":
        basket.products.forEach((product) => {
          if (product.product.category === this.search_For) {
            count += product.BasketQuantity;
          }
        });
        break;
      case "Basket":
        basket.products.forEach((product) => {
          count += product.BasketQuantity;
        });
        break;
    }
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
