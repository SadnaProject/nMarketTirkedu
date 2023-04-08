import { type BasketDTO, type Basket } from "./Basket";

export type CartDTO = {
  storeIdToBasketPurchases: Map<string, BasketDTO[]>;
  totalPrice: number;
};
export class Cart {
  private storeIdToBasketPurchases: Map<string, Basket[]>;

  constructor() {
    throw new Error("Not implemented");
  }
  public getTotalPrice(): number {
    throw new Error("Not implemented");
  }
}
