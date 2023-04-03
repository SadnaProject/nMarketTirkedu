import { type BasketDTO, Basket } from "./Basket";

export type CartDTO = {
  storeIdToBasketPurchases: Map<string, BasketDTO>;
  totalPrice: number;
};
export class Cart {
  private storeIdToBasketPurchases: Map<string, Basket>;

  constructor() {
    this.storeIdToBasketPurchases = new Map();
  }
  public addProduct(productId: string, storeId:string, quantity: number): void {
    let basket = this.storeIdToBasketPurchases.get(storeId);
    if(basket === undefined){
      let new_basket = new Basket(storeId);
      new_basket.addProduct(productId, quantity);
      this.storeIdToBasketPurchases.set(storeId,new_basket);
    }else{
      basket.addProduct(productId, quantity);
    }
  }
  public getTotalPrice(): number {
    throw new Error("Not implemented");
  }
}
