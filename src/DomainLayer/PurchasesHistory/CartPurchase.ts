import { randomUUID } from "crypto";
import { type CartDTO } from "../Users/Cart";
import { type BasketPurchase } from "./BasketPurchase";
import { HasRepos } from "./HasRepos";

// TODO: Does a class need to know its related id, or should the parent hold a map for it?

export type CartPurchaseDTO = {
  id: string;
  storeIdToBasketPurchases: Map<string, BasketPurchase>;
  totalPrice: number;
};
export class CartPurchase extends HasRepos{
  private id: string;
  private storeIdToBasketPurchases: Map<string, BasketPurchase>;
  private totalPrice: number;

  constructor(
    storeIdToBasketPurchases: Map<string, BasketPurchase>,
    totalPrice: number
  ) {
    super();
    this.id = randomUUID();
    this.storeIdToBasketPurchases = storeIdToBasketPurchases;
    this.totalPrice = totalPrice;
  }

  // create getters and setters
  public get StoreIdToBasketPurchases(): Map<string, BasketPurchase> {
    return this.storeIdToBasketPurchases;
  }

  public CartPurchaseToDTO(): CartPurchaseDTO {
    return {
      id: this.id,
      storeIdToBasketPurchases: this.storeIdToBasketPurchases,
      totalPrice: this.totalPrice,
    };
  }
  
}
