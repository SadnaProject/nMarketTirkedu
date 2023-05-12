import { FullBasketDTO } from "../../StoresController";
import {
  Condition_Type,
  LiteralArgs,
} from "../CompositeLogicalCondition/Condition";
import { ILiteralCondition } from "./LiteralCondition";

export class PriceCondition implements ILiteralCondition {
  private condition_type: Condition_Type;
  private amount: number;
  constructor(args: LiteralArgs) {
    this.condition_type = args.condition_type;
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
    switch (this.condition_type) {
      case "AtLeast":
        return price >= this.amount;
      case "AtMost":
        return price <= this.amount;
      case "Exactly":
        return price === this.amount;
    }
  }
}
