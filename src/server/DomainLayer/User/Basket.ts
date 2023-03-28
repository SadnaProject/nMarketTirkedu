import { type BasketProduct } from "./BasketProduct";

export class Basket {
  private storeId: string;
  private products: BasketProduct[];

  constructor(storeId: string) {
    this.storeId = storeId;
    this.products = [];
  }
}
