import { randomUUID } from "crypto";
import { type CartDTO } from "../Users/Cart";
import { type BasketPurchase } from "./BasketPurchase";
import { HasRepos } from "./HasRepos";

// TODO: Does a class need to know its related id, or should the parent hold a map for it?

export type CartPurchaseDTO = {
  purchaseId: string;
  userId: string;
  storeIdToBasketPurchases: Map<string, BasketPurchase>;
  totalPrice: number;
};
export class CartPurchase extends HasRepos{
  private purchaseId: string;
  private storeIdToBasketPurchases: Map<string, BasketPurchase>;
  private totalPrice: number;
  private userId: string;
  constructor(
    userId: string,
    storeIdToBasketPurchases: Map<string, BasketPurchase>,
    totalPrice: number
  ) {
    super();
    this.userId = userId;
    this.purchaseId = randomUUID();
    this.storeIdToBasketPurchases = storeIdToBasketPurchases;
    this.totalPrice = totalPrice;
  }

  // create getters and setters
  public get StoreIdToBasketPurchases(): Map<string, BasketPurchase> {
    return this.storeIdToBasketPurchases;
  }

  public CartPurchaseToDTO(): CartPurchaseDTO {
    return {
      purchaseId: this.purchaseId,
      userId: this.userId,
      storeIdToBasketPurchases: this.storeIdToBasketPurchases,
      totalPrice: this.totalPrice,
    };
  }

  public get PurchaseId(): string {
    return this.purchaseId;
  }
  
}
