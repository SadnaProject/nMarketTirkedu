import { type Discount } from "./Discount";

export class DiscountPolicy {
  private discounts: Discount[];

  constructor() {
    this.discounts = [];
  }
}
