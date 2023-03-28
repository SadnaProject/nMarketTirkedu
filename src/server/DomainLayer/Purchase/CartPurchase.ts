import { type BasketPurchase } from "./BasketPurchase";

export class CartPurchase {
  private basketPurchases: BasketPurchase[];

  constructor() {
    this.basketPurchases = [];
  }
}
