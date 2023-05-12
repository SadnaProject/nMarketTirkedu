import { FullBasketDTO } from "../../StoresController";
import {
  Condition_Type,
  LiteralArgs,
} from "../CompositeLogicalCondition/Condition";
import { ILiteralCondition } from "./LiteralCondition";

export class StoreCondition implements ILiteralCondition {
  private condition_type: Condition_Type;
  private amount: number;
  constructor(args: LiteralArgs) {
    this.condition_type = args.condition_type;
    this.amount = args.amount;
  }
  public isSatisfiedBy(basket: FullBasketDTO): boolean {
    let count = 0;
    basket.products.forEach((product) => {
      count += product.BasketQuantity;
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