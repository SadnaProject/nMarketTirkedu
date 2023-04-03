import { type BasketProductDTO, BasketProduct } from "./BasketProduct";

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
  // add product to the basket, notice that we override the quantity if the product already exists in the basket,
  // if the user wants to add he needs to use the edit product quantity method
  public addProduct(productId: string, quantity: number): void {
    let product = this.products.find((p) => p.ProductId === productId);
    if (product === undefined) {
      let new_product = new BasketProduct(productId, quantity);
      this.products.push(new_product);
    } else {
      product.Quantity = quantity;
    }  
  }

  getTotalPrice(): number {
    throw new Error("Not implemented");
  }
}
