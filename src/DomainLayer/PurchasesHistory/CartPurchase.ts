import { randomUUID } from "crypto";
import { type CartDTO } from "../Users/Cart";
import { type BasketPurchase } from "./BasketPurchase";

// TODO: Does a class need to know its related id, or should the parent hold a map for it?

export type CartPurchaseDTO = {
  id: string;
  storeIdToBasketPurchases: Map<string, BasketPurchase[]>;
  totalPrice: number;
};
export class CartPurchase {
  private id: string;
  private storeIdToBasketPurchases: Map<string, BasketPurchase[]>;
  private totalPrice: number;

  constructor(cart: CartDTO) {
    this.id = randomUUID();
    throw new Error("Method not implemented.");
    // this.storeIdToBasketPurchases = // TODO implement (each basket should be transformed to a basket purchase)
  }
}
