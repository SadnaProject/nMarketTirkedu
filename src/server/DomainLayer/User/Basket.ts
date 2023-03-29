import { type BasketProductDTO, type BasketProduct } from "./BasketProduct";

export type BasketDTO = {
  storeId: string;
  products: BasketProductDTO[];
};
export class Basket {
  private storeId: string;
  private products: BasketProduct[];

  constructor(storeId: string) {
    this.storeId = storeId;
    this.products = [];
  }
  getTotalPrice(): number {
    throw new Error("Not implemented");
  }
}
