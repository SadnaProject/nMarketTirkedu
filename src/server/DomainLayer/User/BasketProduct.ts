export type BasketProductDTO = {
  storeProductId: string;
  quantity: number;
};
export class BasketProduct {
  private storeProductId: string;
  private quantity: number;

  constructor(storeProductId: string, quantity: number) {
    this.storeProductId = storeProductId;
    this.quantity = quantity;
  }
}
