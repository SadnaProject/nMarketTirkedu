import { BasketDTO } from "../Users/Basket";
import { type Discount } from "./Discount";
import { FullBasketDTO } from "./StoresController";
export class DiscountPolicy {
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
    if (this.discounts.length === 0) return basket;
    this.discounts.forEach((discount) => {
      basket = discount.calculateDiscount(basket);
    });
    return basket;
  }
  public applyDiscounts1(basket: BasketDTO) {
    return basket;
  }
}
