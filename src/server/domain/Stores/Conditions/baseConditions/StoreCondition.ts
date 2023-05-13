import { type FullBasketDTO } from "../../StoresController";
import {
  type conditionType,
  type LiteralArgs,
} from "../CompositeLogicalCondition/Condition";
import { type ILiteralCondition } from "./LiteralCondition";

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
