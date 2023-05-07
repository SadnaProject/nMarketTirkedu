import { Discount } from "./Discount";
class DiscountPolicy {
  private storeId: string;
  private discounts: Discount[];
  constructor(storeId: string) {
    this.storeId = storeId;
    this.discounts = [];
  }
  public set Discounts(discounts: Discount[]) {
    this.discounts = discounts;
  }
}
