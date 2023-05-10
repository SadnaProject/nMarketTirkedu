import { BasketDTO } from "../Users/Basket";
import { Constraint } from "./Constraint";
import { FullBasketDTO } from "./StoresController";

export class ContraintPolicy {
  private storeId: string;
  private constraints: Constraint[];
  constructor(storeId: string) {
    this.storeId = storeId;
    this.constraints = [];
  }
  public set Constraints(constraints: Constraint[]) {
    this.constraints = constraints;
  }
  public isSatisfiedBy(basket: FullBasketDTO) {
    return this.constraints.length === 0
      ? true
      : this.constraints.every((constraint) =>
          constraint.isSatisfiedBy(basket)
        );
  }
  public isSatisfiedBy1(basket: BasketDTO) {
    return true;
  }
}
