import { randomUUID } from "crypto";
import { type FullBasketDTO } from "../StoresController";
import { type DiscountArgs, type IDiscount, buildDiscount } from "./Discount";
import { TRPCError } from "@trpc/server";
export class DiscountPolicy {
  private storeId: string;
  private discounts: Map<string, IDiscount>;
  constructor(storeId: string) {
    this.storeId = storeId;
    this.discounts = new Map<string, IDiscount>();
  }

  public addDiscount(args: DiscountArgs, discountID: string) {
    this.discounts.set(discountID, buildDiscount(args));
    return discountID;
  }
  public removeDiscount(discountID: string) {
    const discount = this.discounts.get(discountID);
    if (discount === undefined)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "The requested discount not found",
      });
    this.discounts.delete(discountID);
  }
  public applyDiscounts(basket: FullBasketDTO) {
    if (this.discounts.size === 0) return basket;
    this.discounts.forEach((discount) => {
      basket = discount.calculateDiscount(basket);
    });
    return basket;
  }
}
