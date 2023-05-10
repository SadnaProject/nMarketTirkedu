import { type Discount } from "./Discount";
import { FullBasketDTO } from "./StoresController";
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
  public applyDiscounts(basket: FullBasketDTO) {
    this.discounts.forEach((discount) => {
      basket = discount.calculateDiscount(basket);
    });
    return basket;
  }
}
