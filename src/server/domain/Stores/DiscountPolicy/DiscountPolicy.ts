import { type FullBasketDTO } from "../StoresController";
import { type DiscountArgs, type IDiscount, buildDiscount } from "./Discount";
export class DiscountPolicy {
  private storeId: string;
  private discounts: IDiscount[];
  constructor(storeId: string) {
    this.storeId = storeId;
    this.discounts = [];
  }
  public set Discounts(discounts: IDiscount[]) {
    this.discounts = discounts;
  }
  public addDiscount(args: DiscountArgs) {
    this.discounts.push(buildDiscount(args));
  }

  public applyDiscounts(basket: FullBasketDTO) {
    if (this.discounts.length === 0) return basket;
    this.discounts.forEach((discount) => {
      basket = discount.calculateDiscount(basket);
    });
    return basket;
  }
}
